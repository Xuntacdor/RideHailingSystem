export interface SupportTicketResponse {
    id: string;
    userId: string;
    agentId?: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface SupportTicketRequest {
    userId: string;
    subject: string;
    description: string;
    priority?: string;
}
