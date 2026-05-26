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
            const option = document.createElement('option');
            option.value = name.value;
            option.textContent = name.textContent;
            return option;
          }),
      );
    });

  return (data, state, action) => {
    // @todo: #4.2 — обработать очистку поля
    if (action && action.type === "click") {
      const button = action.target;
      if (button.name === "clear") {
        const fieldName = button.getAttribute("data-field");
        if (fieldName && state.hasOwnProperty(fieldName)) {
          const parentElement = button.parentElement;
          const inputField = parentElement.querySelector(
            "input, select, textarea",
          );

          if (inputField) {
            if (inputField.tagName === "SELECT") {
              inputField.selectedIndex = 0;
            } else {
              inputField.value = "";
            }
          }

          state[fieldName] = "";
        }
      }
    }
    // @todo: #4.5 — отфильтровать данные используя компаратор
    return data.filter((row) => compare(row, state));
  };
}
