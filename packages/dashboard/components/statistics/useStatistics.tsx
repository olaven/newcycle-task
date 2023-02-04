import React from "react";

const useEventSource = (url: string) => {
  const [data, setData] = React.useState<any[]>([]);
  const [initialDataReceived, setInitialDataReceived] = React.useState(false);

  React.useEffect(() => {
    const source = new EventSource(url);
    source.onmessage = (event) => {
      const updates = JSON.parse(event.data);

      if (initialDataReceived) {
        setData([...updates, ...data]);
      } else {
        setData([...updates]);
        setInitialDataReceived(true);
      }
    };
    source.onerror = (event) => {
      console.error({
        message: "Error in data source",
        event,
      });
    };
    return () => {
      source.close();
    };
  }, [url]);

  return data;
};

export const useItemStatistics = (timeUnit: string) => {
  const statistics = useEventSource(
    `http://localhost:8080/statistics/item-creation/${timeUnit}`
  );
  return statistics;
};

export const useTransferStatistics = (timeUnit: string) => {
  const statistics = useEventSource(
    `http://localhost:8080/statistics/transfers/${timeUnit}`
  );
  return statistics;
};
