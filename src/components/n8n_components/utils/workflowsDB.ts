export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes?: any[];
  connections?: any;
  [key: string]: any;
}

// Fetch workflows - returns empty array for Vercel deployment
// The JSON file is not needed for the web version
export async function fetchWorkflows(): Promise<Workflow[]> {
  return [];
}

// Prefetch and store workflows (for compatibility)
export async function prefetchAndStoreWorkflows(): Promise<void> {
  console.log('Workflows prefetch skipped (web version)');
}

export default { fetchWorkflows, prefetchAndStoreWorkflows };
