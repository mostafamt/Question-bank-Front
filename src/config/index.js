import domainList from "./data/domainList.json";
import languageList from "./data/languageList.json";
import ownerList from "./data/ownerList.json";
import subDomainList from "./data/subDomainList.json";

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
