import { createComparison, defaultRules } from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнить выпадающие списки опциями
  Object.keys(indexes) // Получаем ключи из объекта
    .forEach((elementName) => {
      // Перебираем по именам

      elements[elementName].append(
        // в каждый элемент добавляем опции
        ...Object.values(indexes[elementName]) // формируем массив имён, значений опций
          .map((name) => {
            // используйте name как значение и текстовое содержимое
            // @todo: создать и вернуть тег опции
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            return option;
          }),
      );
    });

  return (data, state, action) => {
    // @todo: #4.2 — обработать очистку поля
    if (action && action.type === "submit") {
      const buttonName = action;

      if (buttonName.getAttribute("name") === "clear") {
        const parentElement = buttonName.parentElement;
        const inputField = parentElement.querySelector("input, select");
        inputField.value = "";
        const fieldName = buttonName.getAttribute("data-field");
        state[fieldName] = "";
      }
    }

    if (state.totalFrom !== "" || state.totalTo !== "") {
      state.total = [
        state.totalFrom === ""
          ? Number.MIN_SAFE_INTEGER
          : Number(state.totalFrom),
        state.totalTo === "" ? Number.MAX_SAFE_INTEGER : Number(state.totalTo),
      ];
    }

    console.log(state.total);
    // @todo: #4.5 — отфильтровать данные используя компаратор
    return data.filter((row) => compare(row, state));
  };
}
