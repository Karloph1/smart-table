import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";
const USE_MOCKS = process.env.NODE_ENV === "test";

export function initData(sourceData) {
  // переменные для кеширования данных
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  if (USE_MOCKS) {
    // Имитация данных: создаём 25 записей, продавцов, покупателей
    const mockSellers = { 1: "Иван", 2: "Петр" };
    const mockCustomers = { 1: "Клиент А", 2: "Клиент Б" };
    const mockItems = Array.from({ length: 25 }, (_, i) => ({
      receipt_id: i,
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      seller_id: (i % 2) + 1,
      customer_id: (i % 2) + 1,
      total_amount: 1000 + i,
    }));

    const getIndexes = async () => ({
      sellers: mockSellers,
      customers: mockCustomers,
    });
    const getRecords = async (query) => {
      const limit = parseInt(query.limit) || 10;
      const page = parseInt(query.page) || 1;
      const start = (page - 1) * limit;
      const items = mockItems.slice(start, start + limit);
      return {
        total: mockItems.length,
        items: items.map((item) => ({
          id: item.receipt_id,
          date: item.date,
          seller: mockSellers[item.seller_id],
          customer: mockCustomers[item.customer_id],
          total: item.total_amount,
        })),
      };
    };
    return { getIndexes, getRecords };
  }

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
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
    const records = await response.json();

    lastQuery = nextQuery;
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
