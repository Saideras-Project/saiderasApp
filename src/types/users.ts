export enum UserRole {
  MANAGER = "MANAGER",
  CAIXA = "CAIXA",
  GARCOM = "GARCOM",
}

export type User = {
  id: string;
  name: string;
  username: string;
  password?: string; // Opcional, apenas para envio
  role: UserRole;
  createdAt: string;
};