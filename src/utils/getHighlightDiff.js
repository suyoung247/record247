export function getHighlightDiff(serverList, clientList) {
  const serverMap = new Map(serverList.map((highlight) => [highlight.id, highlight]));
  const clientMap = new Map(clientList.map((highlight) => [highlight.id, highlight]));

  const added = [];
  const updated = [];
  const removed = [];

  clientMap.forEach((clientItem, id) => {
    if (!serverMap.has(id)) {
      added.push(clientItem);
    } else {
      const serverItem = serverMap.get(id);
      if (JSON.stringify(serverItem) !== JSON.stringify(clientItem)) {
        updated.push(clientItem);
      }
    }
  });

  serverMap.forEach((serverItem, id) => {
    if (!clientMap.has(id)) {
      removed.push(serverItem);
    }
  });

  return { added, updated, removed };
}
