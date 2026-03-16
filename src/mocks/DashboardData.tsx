export type PeriodoTempo = "24h" | "7d" | "30d";
export type ParametroClima = "Temperatura" | "Umidade" | "Chuva" | "Ventos";

type ChartDataFormat = {
  categories: string[];
  data: number[];
};

const categorias30d = Array.from({ length: 30 }, (_, i) => ` ${i + 1}`);

const temp30dData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 12) + 20); // 20°C a 31°C
const umidade30dData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 50); // 50% a 79%
const ventos30dData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 15) + 5); // 5 km/h a 19 km/h

// 70% de chance de nao chover (0mm), senão significa que chove todos os dias entre 1 e 20mm
const chuva30dData = Array.from({ length: 30 }, () => 
  Math.random() > 0.3 ? 0 : Math.floor(Math.random() * 20) + 1
);

export const chartMockData: Record<ParametroClima, Record<PeriodoTempo, ChartDataFormat>> = {
  Temperatura: {
    "24h": {
      categories: ["01:00", "03:00", "05:00", "07:00", "10:00", "13:00", "15:00", "17:00", "20:00", "22:00", "23:00"],
      data: [14, 13, 13, 18, 24, 28, 24, 18, 16, 13, 12],
    },
    "7d": {
      categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      data: [22, 24, 25, 21, 19, 23, 26],
    },
    "30d": {
      categories: categorias30d,
      data: temp30dData,
    },
  },
  Umidade: {
    "24h": { categories: ["01:00", "05:00", "10:00", "15:00", "20:00"], data: [80, 85, 55, 65, 80] },
    "7d": { categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"], data: [70, 75, 60, 65, 80, 85, 75] },
    "30d": { categories: categorias30d, data: umidade30dData },
  },
  Chuva: {
    "24h": { categories: ["01:00", "05:00", "10:00", "15:00", "20:00"], data: [0, 0, 5.0, 1.1, 0] },
    "7d": { categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"], data: [12, 0, 0, 5, 18, 2, 0] },
    "30d": { categories: categorias30d, data: chuva30dData },
  },
  Ventos: {
    "24h": { categories: ["01:00", "05:00", "10:00", "15:00", "20:00"], data: [5, 5, 15, 18, 8] },
    "7d": { categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"], data: [10, 15, 12, 25, 8, 10, 18] },
    "30d": { categories: categorias30d, data: ventos30dData },
  },
};