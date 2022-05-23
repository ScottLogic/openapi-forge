import Api from "./api/api";
import Configuration from "./api/configuration";

const config = new Configuration();
const api = new Api(config);

api.findPetsByStatus(["available"]).then((data) => {
  console.log(data.map(s => s.name));
});

// api.getPetById(2323234).then((data) => {
//   console.log(data);
// });
