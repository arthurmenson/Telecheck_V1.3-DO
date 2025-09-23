import { PactV3, MatchersV3 } from "@pact-foundation/pact";
const { like } = MatchersV3;

const pact = new PactV3({
  dir: "contracts/pact",
  consumer: "telecheck-web",
  provider: "telecheck-api",
});

describe("GET /ehr/patients/:id", () => {
  it("returns patient", () =>
    pact
      .addInteraction({
        states: [{ description: "patient exists" }],
        uponReceiving: "a get patient",
        withRequest: { method: "GET", path: "/ehr/patients/123" },
        willRespondWith: {
          status: 200,
          body: like({ id: "123", name: "Jane Doe" }),
        },
      })
      .executeTest(async (mock) => {
        const res = await fetch(mock.url + "/ehr/patients/123");
        const body = await res.json();
        if (!("id" in body)) throw new Error("bad body");
      }));
});
