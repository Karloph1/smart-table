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
    console.log(state);
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
    
    const compareState = {
      ...state,
      totalRange: [
        state.totalFrom ? parseFloat(state.totalFrom) : null,
        state.totalTo ? parseFloat(state.totalTo) : null,
      ],
    };

    delete compareState.totalFrom;
    delete compareState.totalTo;

    // @todo: #4.5 — отфильтровать данные используя компаратор
    return data.filter((row) => compare(row, state));
  };
}
