# MyBuildingPro

Система управления строительными проектами с бюджетированием и аналитикой.

## Технологии

- **Backend**: FastAPI + Python
- **Database**: PostgreSQL (asyncpg)
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **Deployment**: Railway

## Установка и запуск локально

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Настройте переменную окружения DATABASE_URL:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Запустите приложение:
```bash
uvicorn main:app --reload
```

## Деплой на Railway

1. Подключите GitHub репозиторий к Railway
2. Добавьте PostgreSQL плагин в Railway
3. Railway автоматически установит переменную DATABASE_URL
4. Приложение запустится автоматически

## Структура проекта

- `main.py` - основной файл приложения с FastAPI
- `budget_api.py` - API для работы с бюджетом
- `expense_api.py` - API для работы с расходами
- `frontend/` - статические файлы фронтенда
- `uploads/` - загруженные файлы (фото чеков, документы)

## Функционал

- Управление объектами строительства
- Бюджетирование по этапам и видам работ
- Учет приходов и расходов
- Загрузка фотографий и документов
- Аналитика и отчеты
- Экспорт в PDF
