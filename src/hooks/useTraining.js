import { useState } from "react";

export function useTraining() {
  const [trainings, setTrainings] = useState([]);

  const addTraining = (training) => {
    setTrainings((prev) => [...prev, training]);
  };

  const updateTraining = (id, data) => {
    setTrainings((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const assignPeople = (trainingId, people) => {
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === trainingId ? { ...t, participants: people } : t
      )
    );
  };

  return { trainings, addTraining, updateTraining, assignPeople };
}
