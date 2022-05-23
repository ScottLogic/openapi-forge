import Api from "./api/api";
import Configuration from "./api/configuration";
import { Pet } from "./api/model";

const config = new Configuration();
const api = new Api(config);

// api.findPetsByStatus(["available"]).then((data) => {
//   console.log(data.map(s => s.name));
// });

api
  .addPet({
    id: 2330,
    name: "Fido",
    photoUrls: ["http://example.com/photo1"],
    status: "available",
    category: {
      id: 1,
      name: "dog",
    },
    tags: [
      {
        id: 0,
        name: "string",
      },
    ],
  })
  .then((data) => {
    console.log(data);
  });

api.getPetById(2330).then((data) => {
  console.log(data);
});
