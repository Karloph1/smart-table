import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData(sourceData) {
  console.log(sourceData);
  // переменные для кеширования данных
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  // функция для приведения строк в тот вид, который нужен нашей таблице
  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  // функция получения индексов
  const getIndexes = async () => {
    if (!sellers || !customers) {
      // если индексы ещё не установлены, то делаем запросы
      [sellers, customers] = await Promise.all([
        // запрашиваем и деструктурируем в уже объявленные ранее переменные
        fetch(`${BASE_URL}/sellers`).then((res) => res.json()), // запрашиваем продавцов
        fetch(`${BASE_URL}/customers`).then((res) => res.json()), // запрашиваем покупателей
      ]);
    }

    return { sellers, customers };
  };

  // функция получения записей о продажах с сервера
  const getRecords = async (query, isUpdated = false) => {
    console.log("[GET_RECORDS] called", query);
    const qs = new URLSearchParams(query); // преобразуем объект параметров в SearchParams объект, представляющий query часть url
    const nextQuery = qs.toString(); // и приводим к строковому виду

    if (lastQuery === nextQuery && !isUpdated) {
      // isUpdated параметр нужен, чтобы иметь возможность делать запрос без кеша
      return lastResult; // если параметры запроса не поменялись, то отдаём сохранённые ранее данные
    }

    // если прошлый квери не был ранее установлен или поменялись параметры, то запрашиваем данные с сервера
    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);

    console.log("[FETCH_RECORDS_RESPONSE]", response.status, response.ok);

    const records = await response.json();
    console.log("[RECORDS]", records);

    lastQuery = nextQuery; // сохраняем для следующих запросов
    lastResult = {
      total: records.total,
      items: mapRecords(records.items),
    };

    return lastResult;
  };

  return {
    getIndexes,
    getRecords,
  };
}
