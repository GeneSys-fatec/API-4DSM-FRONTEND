import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export interface StationParameter {
    id: number;
    idStation: number;
    idTypeParam: number;
    isActive: boolean;
}

export interface CreateStationParameterPayload {
    idStation: number;
    idTypeParam: number;
    isActive?: boolean;
}

export const stationParameterService = {
    findByStation: async (idStation: number): Promise<StationParameter[]> => {
        try {
            const response = await fetch(`${API_URL}/parameters/station/${idStation}`);
            if (!response.ok) {
                console.error("Erro no GET findByStation:", await response.text());
                throw new Error("Erro ao buscar parâmetros da estação");
            }
            return await response.json();
        } catch (error) {
            console.error("Erro na integração:", error);
            return [];
        }
    },

    create: async (data: CreateStationParameterPayload): Promise<StationParameter | null> => {
        try {
            const response = await fetch(`${API_URL}/parameters/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const erroDoBackend = await response.text();
                console.error("⛔ ERRO DO BACKEND AO VINCULAR:", erroDoBackend);
                toast.error(`Erro ${response.status} ao vincular parâmetro. Olhe o F12!`);
                throw new Error(erroDoBackend);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Erro crítico no fetch de criar parâmetro:", error);
            throw error;
        }
    },

    update: async (id: number, data: CreateStationParameterPayload): Promise<StationParameter | null> => {
        try {
            const response = await fetch(`${API_URL}/parameters/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Erro ao atualizar vínculo");
            return await response.json();
        } catch (error) {
            console.error("Erro ao atualizar vínculo:", error);
            throw error;
        }
    },

    delete: async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/parameters/delete/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error("Erro ao deletar vínculo");
            return true;
        } catch (error) {
            console.error("Erro ao deletar vínculo:", error);
            throw error;
        }
    }
};