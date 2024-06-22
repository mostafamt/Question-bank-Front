const ownerList = ["me", "azharengineering2020", "Public"];

const domainList = [
  {
    id: "2b04abea1cd96b671b003edf9293790a",
    name: "العلوم اولى متوسط2",
  },
  {
    id: "f7ced93fcac2e5623ca460c33e235eb7",
    name: "العلوم",
  },
  {
    id: "543c484398a172ca86a904bcf2e01edb",
    name: "الكمبيوتر وتكنولوجيا المعلومات",
  },
  {
    id: "99d83222b523feffa02b905c51e0ae17",
    name: "كتاب الأحياء الصف الثاني الثانوي",
  },
  {
    id: "107af2368e01458c04665c8b40a460a8",
    name: "الاحياء للصف الاول الثانوي",
  },
  {
    id: "d1a60aa1e6d405768252184c641ec1e5",
    name: "الفيزياء للصف الثالث الثانوي",
  },
  {
    id: "f218777065685ff31441b7ef5bfbc90c",
    name: "جغرافية مصر _ الصف الأول الثانوي",
  },
  {
    id: "9a4da8db8ccaec11566dd0b011b091a5",
    name: "الكمبيوتر وتكنولوجيا المعلومات والإتصالات للصف الاول الاعدادي",
  },
  {
    id: "b126adb0056f26fd38aa4f2b86cfce38",
    name: "جغرافية التنمية للصف الثاني الثانوي",
  },
  {
    id: "c9211cdf9e6ef9e6c25a3ea595ccbc72",
    name: "الكيمياء الصف الثاني الثانوي",
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
    code2: "",
  },
  {
    name: "Spanish",
    code: "es",
    code2: "",
  },
  {
    name: "Italian",
    code: "it",
    code2: "",
  },
  {
    name: "German",
    code: "de",
    code2: "",
  },
];

const subDomainList = {
  "2b04abea1cd96b671b003edf9293790a": [
    {
      id: "3d7a482aa986b4cbb3059a2c6d67149c",
      name: "الغلاف الجوي المتحرك",
    },
    {
      id: "09f9e27ccd2ef0fd5289b9993ed2bf9d",
      name: "استكشاف الفضاء",
    },
  ],
  f7ced93fcac2e5623ca460c33e235eb7: [
    {
      id: "a94a1cd65b36630a1f73a6013ac10661",
      name: "الماده وتركيبها",
    },
    {
      id: "d895b44edcb4bd37e985a6a96da77b7a",
      name: "الطاقة",
    },
  ],
  "543c484398a172ca86a904bcf2e01edb": [
    {
      id: "44e956033811098adef3438230024aaa",
      name: "اساسيات الكمبيوتر ونظم التشغيل",
    },
    {
      id: "dd35e9cdb21f8718bf65e6c03ab71182",
      name: "إنشاء ومعالجة الصور",
    },
  ],
  "99d83222b523feffa02b905c51e0ae17": [
    {
      id: "64e42caf4046ca265cd7cd0e825b618c",
      name: "التغذية والهضم فى الكائنات الحية",
    },
    {
      id: "e3733761d06b273d4ee7fdaa79d833a7",
      name: "النقل فى الكائنات الحية",
    },
  ],
  "107af2368e01458c04665c8b40a460a8": [
    {
      id: "7365f9ae0113f9618b4ee77fce74b46c",
      name: "الباب الثالث: توارث الصفات",
    },
    {
      id: "138521f90082d07d94320dd28e96b182",
      name: "الباب الرابع: تصنيف الكائنات الحية",
    },
  ],
  d1a60aa1e6d405768252184c641ec1e5: [
    {
      id: "f59344cbb70a55d39bbf7e22fb202827",
      name: "الليزر",
    },
    {
      id: "4b65a30a8bd8b0b7c5d5437f51bdebdd",
      name: "الالكترونيات الحديثة",
    },
  ],
  f218777065685ff31441b7ef5bfbc90c: [
    {
      id: "023534e4ea8ffc939ab1b6bb2475b337",
      name: "الموقع ومظاهر سطح مصر",
    },
    {
      id: "5e8f4371149687df0223d4b324aa8f13",
      name: "سكان مصر",
    },
  ],
  "9a4da8db8ccaec11566dd0b011b091a5": [
    {
      id: "e9b890f0b2693427f4fe420e7b69c395",
      name: "أساسيات الكمبيوتر ونظم التشغيل2",
    },
    {
      id: "ec7343976e9f9e43eebb608d66336f5a",
      name: "إنشاء ومعالجة الصور2",
    },
  ],
  b126adb0056f26fd38aa4f2b86cfce38: [
    {
      id: "47bed6e0a8ba685b0e262a410a7ca384",
      name: "مدخل الي جغرافية التنمية",
    },
    {
      id: "012ee9f6f45d6e4542f5be45843397bf",
      name: "جغرافية التنمية وموراد البيئة",
    },
  ],
  c9211cdf9e6ef9e6c25a3ea595ccbc72: [
    {
      id: "485b5a2edc9b5dc6d537a7d1ab92db58",
      name: "الباب الأول: بنية الذرة",
    },
    {
      id: "058e4efd0d93177b65bbd489e4899066",
      name: "الباب الرابع: العناصر الممثلة في بعض المجموعات المنتظمة في الجدول الدوري",
    },
  ],
};

const getDomainName = (domainId) =>
  domainList.find((domain) => domain.id === domainId)?.name || "";

const getSubDomainName = (domainId, subDomainId) =>
  subDomainList[domainId].find((subDomain) => subDomain.id === subDomainId)
    ?.name || "";

const mappedLabels = {
  question: "question",
  optionText: "option",
};

export {
  ownerList,
  domainList,
  languageList,
  subDomainList,
  getDomainName,
  getSubDomainName,
  mappedLabels,
};
