const API_URL = 'http://localhost:3333';

export interface Limits {
    id: number;
    idTypeParam: number;
    minExpected: number;
    maxExpected: number;
}

export interface CreateLimitsPayload {
    idTypeParam: number;
    minExpected: number;
    maxExpected: number;
}

export const limitsService = {
    findAll: async (): Promise<Limits[]> => {
        try {
            const response = await fetch(`${API_URL}/parameter-limits`);

            if (!response.ok) {
                throw new Error("Erro ao buscar limites");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar limites:", error);
            return [];
        }
    },

    findById: async (id: number): Promise<Limits | null> => {
        try {
            const response = await fetch(`${API_URL}/parameter-limits/${id}`);

            if (!response.ok) {
                throw new Error("Erro ao buscar limites");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar limite:", error);
            return null;
        }
    },

    create: async (data: CreateLimitsPayload): Promise<Limits | null> => {
        try {
            const response = await fetch(`${API_URL}/parameter-limits/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Erro ao criar limite");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao criar limite:", error);
            return null;
        }
    },

    update: async (id: number, data: CreateLimitsPayload): Promise<Limits | null> => {
        try {
            const response = await fetch(`${API_URL}/parameter-limits/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar limite");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao atualizar limite:", error);
            return null;
        }
    },

    delete: async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/parameter-limits/delete/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error("Erro ao deletar limite");
            }

            return true;
        } catch (error) {
            console.error("Erro ao deletar limite:", error);
            return false;
        }
    }
}