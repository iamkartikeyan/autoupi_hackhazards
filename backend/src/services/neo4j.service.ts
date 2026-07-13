import { runCypher, isNeo4jConfigured } from '../config/neo4j';

export async function syncUser(user: { id: string; email: string; phone: string; full_name: string; wallet_balance?: number }) {
  if (!isNeo4jConfigured) return;

  const query = `
    MERGE (u:User { id: $userId })
    SET u.email = $email,
        u.phone = $phone,
        u.name = $fullName
    MERGE (w:Wallet { id: 'wallet_' + $userId })
    SET w.balance = $balance,
        w.currency = 'INR'
    MERGE (u)-[:OWNS]->(w)
  `;

  await runCypher(query, {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.full_name,
    balance: user.wallet_balance || 50000.0,
  });
}

export async function syncPool(pool: { id: string; currency: string; total_capacity: number; available: number }) {
  if (!isNeo4jConfigured) return;

  const query = `
    MERGE (p:LiquidityPool { id: $poolId })
    SET p.currency = $currency,
        p.capacity = $capacity,
        p.available = $available
  `;

  await runCypher(query, {
    poolId: pool.id,
    currency: pool.currency,
    capacity: pool.total_capacity,
    available: pool.available,
  });
}

export async function syncTransaction(txn: {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  target_currency: string;
  recipient_id: string;
  recipient_name: string;
  exchange_rate: number;
  fee: number;
  final_amount: number;
  status: string;
  blockchain_hash?: string | null;
  settlement_time?: number | null;
  created_at: string;
}) {
  if (!isNeo4jConfigured) return;

  const query = `
    // 1. Create or match the transaction node
    MERGE (t:Transaction { id: $txnId })
    SET t.amount = $amount,
        t.currency = $currency,
        t.targetCurrency = $targetCurrency,
        t.finalAmount = $finalAmount,
        t.fee = $fee,
        t.rate = $rate,
        t.status = $status,
        t.hash = $hash,
        t.time = $time,
        t.createdAt = $createdAt

    // 2. Match the sender User and their Wallet
    MERGE (u:User { id: $senderId })
    MERGE (w:Wallet { id: 'wallet_' + $senderId })
    MERGE (u)-[:OWNS]->(w)

    // 3. Create the INITIATED relationship
    MERGE (u)-[:INITIATED]->(t)

    // 4. Match or Create the Recipient User node
    MERGE (r:User { phone: $recipientId })
    SET r.name = $recipientName,
        r.isExternal = true

    // 5. Create relationship showing the transaction transfer to recipient
    MERGE (t)-[:TRANSFERRED_TO]->(r)

    // 6. Match and connect to the Liquidity Pool corresponding to target currency
    WITH t
    MATCH (p:LiquidityPool { currency: $targetCurrency })
    MERGE (t)-[:SETTLED_VIA]->(p)
  `;

  await runCypher(query, {
    txnId: txn.id,
    amount: txn.amount,
    currency: txn.currency,
    targetCurrency: txn.target_currency,
    finalAmount: txn.final_amount,
    fee: txn.fee,
    rate: txn.exchange_rate,
    status: txn.status,
    hash: txn.blockchain_hash || 'Pending',
    time: txn.settlement_time || 0.0,
    createdAt: txn.created_at,
    senderId: txn.user_id,
    recipientId: txn.recipient_id,
    recipientName: txn.recipient_name,
  });
}

// Fetches all nodes and links for compliance visualization
export async function getGraphData() {
  if (!isNeo4jConfigured) {
    // Return stunning mock compliance graph data if Neo4j is not connected
    return getMockGraphData();
  }

  const query = `
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, r, m LIMIT 150
  `;

  try {
    const result = await runCypher(query);
    const nodesMap = new Map<string, any>();
    const links: any[] = [];

    result.records.forEach((record: any) => {
      const sourceNode = record.get('n');
      const rel = record.get('r');
      const targetNode = record.get('m');

      if (sourceNode) {
        const id = sourceNode.properties.id || sourceNode.properties.phone || sourceNode.elementId;
        const labels = sourceNode.labels;
        nodesMap.set(id, {
          id,
          label: labels[0] || 'Node',
          properties: sourceNode.properties,
        });
      }

      if (targetNode) {
        const id = targetNode.properties.id || targetNode.properties.phone || targetNode.elementId;
        const labels = targetNode.labels;
        nodesMap.set(id, {
          id,
          label: labels[0] || 'Node',
          properties: targetNode.properties,
        });
      }

      if (rel && sourceNode && targetNode) {
        const sourceId = sourceNode.properties.id || sourceNode.properties.phone || sourceNode.elementId;
        const targetId = targetNode.properties.id || targetNode.properties.phone || targetNode.elementId;
        links.push({
          source: sourceId,
          target: targetId,
          type: rel.type,
          properties: rel.properties,
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links,
    };
  } catch (error) {
    console.error('Error fetching Neo4j graph data:', error);
    return getMockGraphData();
  }
}

function getMockGraphData() {
  const nodes = [
    // Users
    { id: 'usr_admin', label: 'User', properties: { name: 'AutoUPI Admin', email: 'admin@autoupi.com', phone: '+919999999999', role: 'ADMIN' } },
    { id: 'usr_rajesh', label: 'User', properties: { name: 'Rajesh Kumar', email: 'rajesh@demo.com', phone: '+919876543210', role: 'USER' } },
    { id: 'usr_priya', label: 'User', properties: { name: 'Priya Sharma', email: 'priya@demo.com', phone: '+919876543211', role: 'USER' } },
    { id: 'usr_demo', label: 'User', properties: { name: 'Demo User', email: 'demo@autoupi.com', phone: '+911234567890', role: 'USER' } },
    
    // External Recipients (Nodes representing external UPI / international account nodes)
    { id: 'ahmed@uae', label: 'User', properties: { name: 'Ahmed Al-Rashidi', isExternal: true } },
    { id: 'john@uk', label: 'User', properties: { name: 'John Smith', isExternal: true } },
    { id: 'sarah@us', label: 'User', properties: { name: 'Sarah Johnson', isExternal: true } },

    // Wallets
    { id: 'wallet_usr_admin', label: 'Wallet', properties: { balance: 10000000, currency: 'INR' } },
    { id: 'wallet_usr_rajesh', label: 'Wallet', properties: { balance: 75000, currency: 'INR' } },
    { id: 'wallet_usr_priya', label: 'Wallet', properties: { balance: 120000, currency: 'INR' } },
    { id: 'wallet_usr_demo', label: 'Wallet', properties: { balance: 50000, currency: 'INR' } },

    // Liquidity Pools
    { id: 'pool_aed', label: 'LiquidityPool', properties: { currency: 'AED', capacity: 2500000, available: 2200000 } },
    { id: 'pool_usd', label: 'LiquidityPool', properties: { currency: 'USD', capacity: 1000000, available: 870000 } },
    { id: 'pool_gbp', label: 'LiquidityPool', properties: { currency: 'GBP', capacity: 750000, available: 650000 } },

    // Transactions
    { id: 'txn_01', label: 'Transaction', properties: { amount: 15000, currency: 'INR', targetCurrency: 'AED', finalAmount: 662.55, status: 'COMPLETED', time: 7.2, hash: '0x32a76f2b...86ec', createdAt: '2026-07-10' } },
    { id: 'txn_02', label: 'Transaction', properties: { amount: 25000, currency: 'INR', targetCurrency: 'USD', finalAmount: 300.0, status: 'COMPLETED', time: 6.8, hash: '0xf0124c1a...e7d0', createdAt: '2026-07-11' } },
    { id: 'txn_03', label: 'Transaction', properties: { amount: 50000, currency: 'INR', targetCurrency: 'GBP', finalAmount: 470.0, status: 'COMPLETED', time: 7.9, hash: '0x1023d8ab...9fca', createdAt: '2026-07-12' } },
    { id: 'txn_active', label: 'Transaction', properties: { amount: 10000, currency: 'INR', targetCurrency: 'AED', finalAmount: 441.7, status: 'PROCESSING', time: 0, hash: 'Pending', createdAt: '2026-07-13' } },
  ];

  const links = [
    // Ownerships
    { source: 'usr_admin', target: 'wallet_usr_admin', type: 'OWNS' },
    { source: 'usr_rajesh', target: 'wallet_usr_rajesh', type: 'OWNS' },
    { source: 'usr_priya', target: 'wallet_usr_priya', type: 'OWNS' },
    { source: 'usr_demo', target: 'wallet_usr_demo', type: 'OWNS' },

    // Initiations
    { source: 'usr_rajesh', target: 'txn_01', type: 'INITIATED' },
    { source: 'usr_priya', target: 'txn_02', type: 'INITIATED' },
    { source: 'usr_admin', target: 'txn_03', type: 'INITIATED' },
    { source: 'usr_demo', target: 'txn_active', type: 'INITIATED' },

    // Settled via Liquidity Pools
    { source: 'txn_01', target: 'pool_aed', type: 'SETTLED_VIA' },
    { source: 'txn_02', target: 'pool_usd', type: 'SETTLED_VIA' },
    { source: 'txn_03', target: 'pool_gbp', type: 'SETTLED_VIA' },
    { source: 'txn_active', target: 'pool_aed', type: 'SETTLED_VIA' },

    // Transferred to external users
    { source: 'txn_01', target: 'ahmed@uae', type: 'TRANSFERRED_TO' },
    { source: 'txn_02', target: 'sarah@us', type: 'TRANSFERRED_TO' },
    { source: 'txn_03', target: 'john@uk', type: 'TRANSFERRED_TO' },
    { source: 'txn_active', target: 'ahmed@uae', type: 'TRANSFERRED_TO' },
  ];

  return { nodes, links };
}
