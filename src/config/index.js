const ownerList = ["me", "azharengineering2020", "Public"];

const domainList = [
  {
    id: "2711ca97c3a47af8c82925e8cd233d0e",
    name: "Science",
  },
  {
    id: "ea593b9efe036879f9329e46051356af",
    name: "Scube Test Domain",
  },
  {
    id: "11040bd29db4ec9964af9fd3f9a24f17",
    name: "English",
  },
  {
    id: "9e049fdbbd5d3231aca237523c080f98",
    name: "Mathematics",
  },
  {
    id: "c18c5b9f201272dee14f57072f6ba0da",
    name: "\u0627\u0644\u0644\u063a\u0629 \u0639\u0631\u0628\u064a\u0629",
  },
];

const languageList = [
  {
    name: "English",
    code: "en",
  },
  {
    name: "Arabic",
    code: "ar",
  },
  {
    name: "French",
    code: "fr",
  },
  {
    name: "Spanish",
    code: "es",
  },
  {
    name: "Italian",
    code: "it",
  },
  {
    name: "German",
    code: "de",
  },
];

const subDomainList = {
  "2711ca97c3a47af8c82925e8cd233d0e": [
    {
      id: "d7c8da80d67227affcb50494c1a9cfa7",
      name: "Chemistry",
    },
    {
      id: "038052552f7b04e4b2523203d3c25489",
      name: "Biology",
    },
    {
      id: "947832f2ea8e42b1bd9ec7792656fa11",
      name: "Physics",
    },
    {
      id: "0e178a4c34ec6e68ac1961063c959bc6",
      name: "Earth And Space",
    },
  ],
  ea593b9efe036879f9329e46051356af: [
    {
      id: "8922af923453305fb60e39f5c205ccdb",
      name: "Scube Test Sub Domain",
    },
    {
      id: "36803fa1138cfc14228e3f610e0be621",
      name: "\u0643\u062a\u0627\u0628 \u0627\u0644\u062a\u0627\u0631\u064a\u062e",
    },
    {
      id: "435782db96dcf68ede05f9083f75c9a3",
      name: "\u0643\u062a\u0627\u0628 \u0627\u0644\u0641\u0642\u0647",
    },
    {
      id: "e377927d4038fbd96ebc15b14b68ad5b",
      name: "Biology Book",
    },
    {
      id: "257cb9ff74e0f915a115f902c91bc372",
      name: "Templates",
    },
    {
      id: "b655edc9aa463bb21a20c9436d88abea",
      name: "Oer",
    },
    {
      id: "0b593ea117a5a626f2717b55f4f25be5",
      name: "\u0643\u062a\u0627\u0628 \u0627\u0644\u062c\u063a\u0631\u0627\u0641\u064a\u0627",
    },
  ],
  "11040bd29db4ec9964af9fd3f9a24f17": [
    {
      id: "5b54453727356ee78c4df072d6c819f5",
      name: "Grammar ",
    },
    {
      id: "7300ce8f1fd1f2c590148608ce4ca084",
      name: "Reading-Fiction",
    },
    {
      id: "a31e33df2e3ffada9ee66a640b5c82a0",
      name: "Reading-None Fiction",
    },
    {
      id: "e986cbf8ecf0b29c8aee29aa1324cdbd",
      name: "Reading-Play Scripts",
    },
    {
      id: "9aff55227a725968ea9899464e7d7c84",
      name: "Poetry",
    },
    {
      id: "a8ae3f8747543dc53054e6ccbb5fcb1b",
      name: "Writing",
    },
    {
      id: "c0ff938e396e72c225bd66562b80a77e",
      name: "Listening",
    },
  ],
  "9e049fdbbd5d3231aca237523c080f98": [
    {
      id: "78c4822e271ae44dd7798dfd8abf35f7",
      name: "Arithmetic",
    },
    {
      id: "89c09a008ced9339e7e944ff2cc059b5",
      name: "Algebra",
    },
    {
      id: "b22957ad8078e8d73de61aef53d13a74",
      name: "Geometry",
    },
    {
      id: "bd71bd5ee6287c5c736482440a55f6b3",
      name: "Statistics",
    },
  ],
  c18c5b9f201272dee14f57072f6ba0da: [
    {
      id: "2e8f13497661c3f5fa75e4e9e691788c",
      name: "\u0642\u0631\u0627\u0621\u0629",
    },
    {
      id: "89059e59099e833b2b567a20c908e838",
      name: "\u0645\u062d\u0641\u0648\u0638\u0627\u062a",
    },
    {
      id: "30e6ce8de68573881a464980d0b32372",
      name: "\u0646\u062d\u0648",
    },
    {
      id: "d00b4d8fc3d1035ed2d9ea96b62e8158",
      name: "\u062a\u0639\u0628\u064a\u0631",
    },
    {
      id: "05d2776875465164c025d6e6b6c0e6ab",
      name: "\u062e\u0637",
    },
  ],
};

const getDomainName = (domainId) =>
  domainList.find((domain) => domain.id === domainId)?.name || "";

const getSubDomainName = (domainId, subDomainId) =>
  subDomainList[domainId].find((subDomain) => subDomain.id === subDomainId)
    ?.name || "";

export {
  ownerList,
  domainList,
  languageList,
  subDomainList,
  getDomainName,
  getSubDomainName,
};
