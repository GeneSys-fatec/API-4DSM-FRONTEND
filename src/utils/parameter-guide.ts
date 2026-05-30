export interface ParameterTooltipContent {
  unit: string;
  description: string;
  importance: string;
}

export const parameterTooltipByKey: Record<string, ParameterTooltipContent> = {
  chuva_mm: {
    unit: "mm",
    description: "Mostra quanto de chuva caiu no local. É a medida da água acumulada em um período.",
    importance: "Ajuda a identificar riscos de alagamentos, enchentes e a saturação do solo.",
  },
  umidade: {
    unit: "%",
    description: "Indica o quanto o ar está úmido ou seco naquele momento.",
    importance: "Afeta a sensação de conforto térmico e ajuda a prever a formação de neblina ou mofo.",
  },
  co2: {
    unit: "ppm",
    description: "Mostra a quantidade de dióxido de carbono presente no ar.",
    importance: "Monitora a qualidade do ar, indicando se há acúmulo de poluentes que podem afetar a saúde.",
  },
  pm25: {
    unit: "µg/m³",
    description: "Mede partículas muito pequenas em suspensão no ar, quase invisíveis a olho nu.",
    importance: "Identifica a presença de poeira fina e fumaça, que são prejudiciais à respiração.",
  },
  qualidade_index: {
    unit: "AQI",
    description: "Resume a qualidade do ar em um índice fácil de entender, considerando vários poluentes.",
    importance: "Um resumo simples para saber se é seguro realizar atividades ao ar livre.",
  },
  umidade_solo: {
    unit: "%",
    description: "Mostra quanta água o solo está retendo no momento.",
    importance: "Indica se as plantas precisam de irrigação ou se o solo está encharcado demais.",
  },
  ph: {
    unit: "pH",
    description: "Indica se o solo está mais ácido, neutro ou alcalino.",
    importance: "Essencial para saber se a terra é adequada para o cultivo de certas plantas.",
  },
  temp_solo: {
    unit: "°C",
    description: "Mede a temperatura do solo onde as raízes e a umidade interagem.",
    importance: "Afeta o crescimento das raízes e a velocidade com que a água evapora do solo.",
  },
  temperatura: {
    unit: "°C",
    description: "Mostra a temperatura do ar ao redor da estação.",
    importance: "A variável principal para detectar ondas de calor ou frio intenso e orientar o vestuário.",
  },
  luminosidade: {
    unit: "lux",
    description: "Mede a intensidade da luz solar que atinge a superfície.",
    importance: "Importante para monitorar a radiação solar e a necessidade de luz para o crescimento de plantas.",
  },
};

