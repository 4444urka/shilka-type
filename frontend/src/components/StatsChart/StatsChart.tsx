import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Text } from "@chakra-ui/react";
import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TypingSession } from "../../types/TypingSession";

export interface StatsChartProps {
  sessions: TypingSession[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ sessions }) => {
  // Преобразование данных для useChart с учетом локального часового пояса
  const chartData = sessions.map((session) => {
    // Парсим время как UTC и конвертируем в локальное время
    const date = new Date(
      session.created_at + (session.created_at.endsWith("Z") ? "" : "Z")
    );
    // Используем локальные методы для отображения времени в часовом поясе пользователя
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return {
      date: `${day}.${month} ${hours}:${minutes}`,
      wpm: session.wpm,
      accuracy: session.accuracy,
    };
  });

  const chart = useChart({
    data: chartData,
    series: [
      { name: "wpm", color: "primaryColor" },
      { name: "accuracy", color: "gray.300" },
    ],
  });

  return (
    <Box
      w="100%"
      fontSize="20px"
      textStyle="body"
      p={4}
      bg="bgCardColor"
      borderRadius="md"
    >
      <Text mb={4} color="primaryColor" fontSize="20px">
        Статистика
      </Text>

      <Chart.Root chart={chart} width="100%" height={500}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ opacity: 0 }} stroke="#2d3748" />
            <YAxis
              tick={{ fontSize: 12, fill: "#718096" }}
              stroke="#2d3748"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "14px" }} iconType="line" />
            <Line
              type="monotone"
              dot={false}
              dataKey="wpm"
              stroke={chart.color("primaryColor")}
              strokeWidth={3}
              name="WPM"
            />
            <Line
              type="monotone"
              dot={false}
              dataKey="accuracy"
              stroke={chart.color("gray.400")}
              strokeWidth={3}
              name="Accuracy (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Chart.Root>
    </Box>
  );
};
