import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    const afterTemplates = after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    })

    const beforeTemplates = before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    })

    root.container.addEventListener('change', () =>{
        onAction();
    });

    root.container.addEventListener('reset', (e) =>{
        setTimeout(onAction);
    });

    root.container.addEventListener('submit', (e) =>{
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach(key => { 
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            })

            return row.container;
         })
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}