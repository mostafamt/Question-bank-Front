import React from "react";
import Select from "../Select/Select";
import { useStore } from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../services/api";

import styles from "./objectType.module.scss";
import { getBaseTypeFromType } from "../../utils/helper";

const ObjectType = () => {
  const { data: state, setFormState } = useStore();

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: [`categories`],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
  });

  let labels = [];
  if (categories) {
    const selectedCategory = categories.find(
      (cat) => cat.typeName === state.category
    );
    labels = selectedCategory?.labels;
  }
  console.log("labels= ", labels);

  const onChangeCategory = (event) => {
    setFormState({
      ...state,
      category: event.target.value,
    });
  };

  const onChangeType = (event) => {
    const higherType = event.target.value;

    const baseType = getBaseTypeFromType(
      categories,
      state.category,
      higherType
    );

    setFormState({
      ...state,
      higherType,
      type: baseType,
    });
  };

  return (
    <div className={styles["object-type"]}>
      <Select
        variant="SIMPLE"
        label="category"
        value={state.category}
        onChange={onChangeCategory}
      >
        {categories?.map((category) => (
          <option value={category.typeName}>{category.typeName}</option>
        ))}
      </Select>
      <Select
        variant="SIMPLE"
        label="Type"
        value={state.higherType}
        onChange={onChangeType}
      >
        {labels?.map((item, idx) => (
          <option key={idx} value={Object.keys(item)?.[0]}>
            {Object.keys(item)?.[0]}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default ObjectType;
