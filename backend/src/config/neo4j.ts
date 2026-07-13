import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

let driver: Driver | null = null;
export let isNeo4jConfigured = false;

if (uri && username && password) {
  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    isNeo4jConfigured = true;
    console.log('⚡ Neo4j Driver initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Neo4j driver:', error);
  }
} else {
  console.warn('⚠️  Neo4j environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD) not found. Neo4j is running in MOCK mode.');
}

export function getNeo4jDriver(): Driver | null {
  return driver;
}

export async function runCypher(query: string, params: Record<string, any> = {}): Promise<any> {
  if (!isNeo4jConfigured || !driver) {
    // In-memory mock response handler for queries
    return { records: [] };
  }

  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result;
  } finally {
    await session.close();
  }
}

export async function testNeo4jConnection(): Promise<boolean> {
  if (!isNeo4jConfigured || !driver) {
    return false;
  }
  try {
    await runCypher('RETURN 1');
    console.log('✅ Neo4j AuraDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Neo4j connection failed:', error);
    return false;
  }
}

export async function closeNeo4jDriver() {
  if (driver) {
    await driver.close();
  }
}
