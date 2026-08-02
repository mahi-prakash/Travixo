export function useDragAndDrop({
  isReadOnly,
  days,
  setDays,
  placePool,
  setPlacePool,
  pushToHistory,
  setHasUnsavedChanges,
  unsavedRef,
  activeTripId,
  saveItineraryToCache
}) {
  const onDragEnd = (result) => {
    if (isReadOnly) return;
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    pushToHistory();
    if (unsavedRef) unsavedRef.current = true;
    setHasUnsavedChanges(true);

    // Case 1: Reordering within Place Pool
    if (source.droppableId === "place-pool" && destination.droppableId === "place-pool") {
      const newPool = Array.from(placePool);
      const [moved] = newPool.splice(source.index, 1);
      newPool.splice(destination.index, 0, moved);
      setPlacePool(newPool);
      return;
    }

    // Case 2: Moving from Place Pool to a Day
    if (source.droppableId === "place-pool" && destination.droppableId !== "place-pool") {
      const newPool = Array.from(placePool);
      const [moved] = newPool.splice(source.index, 1);

      const destDay = days[destination.droppableId];
      const newItems = Array.from(destDay.items || []);
      newItems.splice(destination.index, 0, moved);

      const newDays = { ...days, [destination.droppableId]: { ...destDay, items: newItems } };
      setPlacePool(newPool);
      setDays(newDays);
      if (saveItineraryToCache && activeTripId) saveItineraryToCache(activeTripId, { days: newDays });
      return;
    }

    // Case 3: Moving from a Day to Place Pool
    if (source.droppableId !== "place-pool" && destination.droppableId === "place-pool") {
      const sourceDay = days[source.droppableId];
      const newItems = Array.from(sourceDay.items || []);
      const [moved] = newItems.splice(source.index, 1);

      const newPool = Array.from(placePool);
      newPool.splice(destination.index, 0, moved);

      const newDays = { ...days, [source.droppableId]: { ...sourceDay, items: newItems } };
      setDays(newDays);
      setPlacePool(newPool);
      if (saveItineraryToCache && activeTripId) saveItineraryToCache(activeTripId, { days: newDays });
      return;
    }

    // Case 4: Moving within the same Day or between two Days
    if (source.droppableId === destination.droppableId) {
      const day = days[source.droppableId];
      const newItems = Array.from(day.items);
      const [moved] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, moved);
      const newDays = { ...days, [source.droppableId]: { ...day, items: newItems } };
      setDays(newDays);
      if (saveItineraryToCache && activeTripId) saveItineraryToCache(activeTripId, { days: newDays });
    } else {
      const sourceDay = days[source.droppableId];
      const destDay = days[destination.droppableId];
      const sourceItems = Array.from(sourceDay.items);
      const destItems = Array.from(destDay.items);
      const [moved] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, moved);
      const newDays = {
        ...days,
        [source.droppableId]: { ...sourceDay, items: sourceItems },
        [destination.droppableId]: { ...destDay, items: destItems },
      };
      setDays(newDays);
      if (saveItineraryToCache && activeTripId) saveItineraryToCache(activeTripId, { days: newDays });
    }
  };

  return { onDragEnd };
}
