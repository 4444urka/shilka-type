# Настройка тёмной темы в Shilka Type

## Шаги для завершения настройки:

### 1. Установите необходимый пакет

```bash
cd frontend
npm install next-themes
```

### 2. Что уже сделано:

✅ **semanticTokens.ts** - добавлены цвета для светлой и тёмной темы:

- `primaryColor` - основной акцентный цвет
- `bgCardColor` - фон карточек
- `bgPage` - фон страницы
- `textPrimary`, `textSecondary`, `textMuted` - цвета текста
- `borderColor` - цвет границ
- `errorColor`, `successColor` - цвета состояний

✅ **ThemeToggle.tsx** - компонент переключения темы (иконка солнца/луны)

✅ **main.tsx** - добавлен `ThemeProvider` от next-themes

✅ **Header.tsx** - добавлена кнопка переключения темы

✅ **globalCss.ts** - обновлены глобальные стили для поддержки обеих тем

### 3. Как использовать semantic tokens в компонентах:

Замените прямые ссылки на цвета на semantic tokens:

**Было:**

```tsx
<Box bg="white" color="gray.800" borderColor="gray.200">
```

**Стало:**

```tsx
<Box bg="bgPage" color="textPrimary" borderColor="borderColor">
```

### 4. Доступные semantic tokens:

**Цвета:**

- `primaryColor` - основной цвет (cyan.500 / cyan.400)
- `bgPage` - фон страницы (white / gray.900)
- `bgCardColor` - фон карточек (gray.50 / gray.800)
- `textPrimary` - основной текст (gray.900 / gray.100)
- `textSecondary` - вторичный текст (gray.600 / gray.400)
- `textMuted` - приглушённый текст (gray.500 / gray.500)
- `borderColor` - границы (gray.200 / gray.700)
- `errorColor` - ошибки (red.600 / red.400)
- `successColor` - успех (green.600 / green.400)

### 5. Компоненты для обновления:

Рекомендуется обновить следующие компоненты для полной поддержки тёмной темы:

- `Homepage.tsx` - заменить `bg`, `color`
- `Stats.tsx` - обновить фоны и цвета текста
- `SignIn.tsx` / `SignUp.tsx` - формы входа/регистрации
- `Leaderboard.tsx` - список лидеров
- `StatsChart.tsx` - графики
- `TypingScreen.tsx` - экран набора

### 6. Пример обновления компонента:

```tsx
// Было
<Box bg="gray.50" color="gray.800" borderColor="gray.200">
  <Text color="cyan.500">Заголовок</Text>
</Box>

// Стало
<Box bg="bgCardColor" color="textPrimary" borderColor="borderColor">
  <Text color="primaryColor">Заголовок</Text>
</Box>
```

### 7. Тестирование:

1. Запустите приложение
2. Нажмите на иконку луны/солнца в Header
3. Проверьте, что все компоненты корректно отображаются в обеих темах

### 8. Дополнительные улучшения (опционально):

- Сохранение выбранной темы в localStorage (уже работает через next-themes)
- Анимации переходов между темами (уже добавлена в globalCss)
- Специальные стили для тёмной темы (можно добавить через `_dark` в компонентах)

## Готово! 🎉

Теперь ваше приложение поддерживает тёмную тему. Пользователи могут переключаться между светлой и тёмной темой с помощью кнопки в Header.
