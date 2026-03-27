const API_URL = 'http://localhost:3333';

export interface Parameter {
    id: number;
    key: string;
    name: string;
    unit: string;
    factor: number;
    offset: number;
    description?: string;
}

export interface CreateParameterPayload {
    key: string;
    name: string;
    unit: string;
    factor: number;
    offset: number;
    description?: string;
}

export const parameterService = {
    findAll: async (): Promise<Parameter[]> => {
        try {
            const response = await fetch(`${API_URL}/parameter-types`);

            if (!response.ok) {
                throw new Error("Erro ao buscar parâmetros");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro na integração de parâmetros:", error);
            return [];
        }
    },

    findById: async (id: number): Promise<Parameter | null> => {
        try {
            const response = await fetch(`${API_URL}/parameter-types/${id}`);

            if (!response.ok) {
                throw new Error("Erro ao buscar parâmetro");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar parâmetro:", error);
            return null;
        }
    },

    create: async (data: CreateParameterPayload): Promise<Parameter | null> => {
        try {
            const response = await fetch(`${API_URL}/parameter-types/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Erro ao criar parâmetro");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao criar parâmetro:", error);
            return null;
        }
    },

    update: async (id: number, data: CreateParameterPayload): Promise<Parameter | null> => {
        try {
            const response = await fetch(`${API_URL}/parameter-types/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar parâmetro");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao atualizar parâmetro:", error);
            return null;
        }
    },

    delete: async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/parameter-types/delete/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Erro ao deletar parâmetro");
            }

            return true;
        } catch (error) {
            console.error("Erro ao deletar parâmetro:", error);
            return false;
        }
    },
};
