import { Account, Client, ID, TablesDB } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const leadsTableId = import.meta.env.VITE_APPWRITE_LEADS_TABLE_ID;

export const isAppwriteConfigured = Boolean(endpoint && projectId && databaseId && leadsTableId);

const client = new Client();
if (endpoint) client.setEndpoint(endpoint);
if (projectId) client.setProject(projectId);

const account = new Account(client);
const tablesDB = new TablesDB(client);

export async function createAccount(name: string, email: string, password: string) {
  if (!endpoint || !projectId) {
    throw new Error("Appwrite belum dikonfigurasi. Isi VITE_APPWRITE_ENDPOINT dan VITE_APPWRITE_PROJECT_ID di .env.local.");
  }

  return account.create({ userId: ID.unique(), email, password, name });
}

export async function signIn(email: string, password: string) {
  if (!endpoint || !projectId) {
    throw new Error("Appwrite belum dikonfigurasi. Isi VITE_APPWRITE_ENDPOINT dan VITE_APPWRITE_PROJECT_ID di .env.local.");
  }

  return account.createEmailPasswordSession({ email, password });
}

export async function createLead(data: {
  leadType: "demo" | "contact";
  name: string;
  email: string;
  company?: string;
  teamSize?: string;
  message: string;
}) {
  if (!isAppwriteConfigured) {
    throw new Error("Appwrite belum dikonfigurasi. Isi variabel VITE_APPWRITE_* di file .env.local.");
  }

  return tablesDB.createRow({
    databaseId,
    tableId: leadsTableId,
    rowId: ID.unique(),
    data: {
      ...data,
      company: data.company ?? "",
      teamSize: data.teamSize ?? "",
    },
  });
}