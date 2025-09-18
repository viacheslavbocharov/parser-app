// Инициализация single-node replica set.
// Во время init контейнер стартует локально, поэтому host — localhost:27017.
try {
  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] });
} catch (_e) {}
try {
  rs.status();
} catch (_e) {}
