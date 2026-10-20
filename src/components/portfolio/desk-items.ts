export type DeskItem = { id: string; label: string; skill: string; note: string };
export const deskItems: DeskItem[] = [
  { id: "laptop", label: "the laptop", skill: "Python · FastAPI", note: "where every backend starts." },
  { id: "gpu", label: "the GPU", skill: "PyTorch", note: "inference pipelines & deepfake forensics." },
  { id: "mug", label: "the mug", skill: "C++", note: "for when it has to be fast. fuelled by chai." },
  { id: "plant", label: "the plant", skill: "React", note: "frontends that grow on you." },
  { id: "server", label: "the box", skill: "Docker · Redis", note: "containers, queues, shipping." },
  { id: "books", label: "the books", skill: "DSA · OS · DBMS", note: "the fundamentals, always." },
];

