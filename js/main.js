// Стандартное значение для элемента таблицы
const DEFAULT_VALUE = '-';

// Селектор для элементов таблицы
const GRID_CHILD_SELECTOR = '.grid .grid__cell';

// Идентификаторы для игроков
const HUMAN_PLAYER = 'human_player';
const COMPUTER_PLAYER = 'computer_player';

// Селекторы для игроков
const BOARD_PLAYER = '.board__player';
const BOARD_COMPUTER = '.board__computer';

// Селекторы для табло игроков
const SCORE_PLAYER = '.score-player';
const SCORE_COMPUTER = '.score-computer';

// Цвета
const COLOR_WIN_HUMAN = '#66CC66';
const COLOR_WIN_COMPUTER = '#ef5959';

// Выигрышные комбинации
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]
];

/**
 * Класс, представляющий игрока
 */
class Player {

    /**
     * Инициализация игрока
     * @param name - имя
     * @param cross - X или O
     */
    constructor(name, cross) {
        this.name = name;
        this.cross = cross;
    }

    /**
     * Переключатель для X/O
     */
    toggle() {
        this.cross = !this.cross;
    }

}

/**
 * Класс, представляющий игру крестики-нолики
 */
class Game {

    /**
     * Инициализация игры
     */
    constructor() {

        // Состояние игры
        this.isGameActive = true;

        // Данные об игроках
        this.players = [
            new Player(HUMAN_PLAYER, true),
            new Player(COMPUTER_PLAYER, false)
        ];

        // Элементы таблицы
        this.gridCells = this.getGridCells();

        // Сброс элементов
        this.clearCells();

        // Ожидание хода игрока
        this.setActivePlayer(this.players[0]);

        // Бинд для события при клике на элемент таблицы
        this._clickHandler = this._clickHandler.bind(this);

        // Регистрация событий на клик
        this.setClickEvent();

    }

    /**
     * Переход к следующей игре
     * @returns {Promise<void>}
     */
    async nextGame() {

        // Пауза на 2 секунды
        await new Promise(resolve =>
            setTimeout(() => {
                resolve();
            }, 2000)
        );

        // Активация игры
        this.isGameActive = true;

        // Очистка декораций
        this.clearDecoration();

        // Сброс элементов
        this.clearCells();

        // Смена очередности
        this.players.forEach((player) => {
            player.toggle()
        });

        this.setActivePlayer(
            !this.players[0].cross ? this.players[1] : this.players[0]
        );

        // Если ход принадлежит компьютеру, запускаем его логику
        if (this.currentPlayer.name === COMPUTER_PLAYER) {
            await this.playComputerPlayer();
        }

    }

    /**
     * Действие при клике
     * @param e
     * @returns {Promise<void>}
     * @private
     */
    async _clickHandler(e) {

        // Если игра активна & ход принадлежит человеку
        if (this.isGameActive && this.currentPlayer.name === HUMAN_PLAYER) {

            // Если значение элемента содержит стандартное значение
            if (e.target.innerText === DEFAULT_VALUE) {

                // Определение типа хода
                e.target.innerText = this.currentPlayer.cross ? 'X' : 'O';

                // Обнаружились победные позиции
                if (this.checkWinner()) {
                    await this.nextGame();
                } else {
                    // Ход для компьютера
                    this.setActivePlayer(this.players[1]);
                    await this.playComputerPlayer();
                }

            }
        }
    }

    /**
     * Получение актуальных элементов
     * @returns {{}[]}
     */
    getGridCells() {
        return Array.from(
            document.querySelectorAll(GRID_CHILD_SELECTOR)
        );
    }

    /**
     * Регистрация обработчика события
     * Для клика по элементу таблицы
     */
    setClickEvent() {
        this.gridCells.forEach((item) => {
            item.addEventListener('click', this._clickHandler);
        });
    }

    /**
     * Проверка победных позиций
     * Определение победителя
     * @returns {boolean}
     */
    checkWinner() {

        // По умолчанию победитель не найден
        let result = false;

        // Получение актуальных элементов
        this.gridCells = this.getGridCells();

        // Проверка победных позиций
        WINNING_COMBINATIONS.forEach((positions) => {

            // Значения элементов
            const stateOne = this.gridCells[positions[0]].innerText;
            const stateSecond = this.gridCells[positions[1]].innerText;
            const stateThird = this.gridCells[positions[2]].innerText;

            // Если значение не равняется стандартному, и текста 3 позиций идентичны друг другу
            if (stateOne !== DEFAULT_VALUE && stateOne === stateSecond && stateSecond === stateThird) {

                // Определение игрока, которому принадлежат победные позиции
                const player = (this.players[0].cross === (stateOne === 'X')) ? this.players[0] : this.players[1];

                // Очистка декораций
                this.winDecoration(player, positions);

                // Обновление табло
                this.winScore(player);

                // Добавление в историю
                this.winHistory(player);

                // Деактивация игры
                this.isGameActive = false;

                // Победитель определен
                result = true;
            }

        });

        return result;

    }

    /**
     * Декорация победы
     * @param player {Player} - Экземпляр игрока
     * @param positions {Object} - Выигрышные позиции
     */
    winDecoration(player, positions) {

        const color = (player.name === HUMAN_PLAYER) ? COLOR_WIN_HUMAN : COLOR_WIN_COMPUTER;

        positions.forEach((position) => {
            this.gridCells[position].style.backgroundColor = color;
        });

    }

    /**
     * Обновление табло для игрока
     * @param player {Player} - Экземпляр игрока
     */
    winScore(player) {

        // Селектор табло игрока / компьютера
        const selector = (player.name === HUMAN_PLAYER) ? SCORE_PLAYER : SCORE_COMPUTER;

        // Текущее количество побед
        const score = Number(
            document.querySelector(selector).innerText
        );

        // Увеличиваем соответствующее табло на 1 ед.
        document.querySelector(selector).innerText = score + 1;

    }

    /**
     * Добавлении истории для выигрыша / проигрыша
     * @param player {Player} - Экземпляр игрока
     */
    winHistory(player) {

        // Текст для истории
        let text = '';

        // Текущее табло
        const score_player = document.querySelector(SCORE_PLAYER).innerText;
        const score_computer = document.querySelector(SCORE_COMPUTER).innerText;

        // Выигрыш / проигрыш
        if (player.name === HUMAN_PLAYER) {
            text = `Выигрыш ${score_player}:${score_computer}`;
        } else {
            text = `Проигрыш ${score_player}:${score_computer}`;
        }

        // Добавление истории
        document.querySelector('.history').innerHTML += `${text}<br>`;

    }

    /**
     * Добавлении истории для ничьи
     */
    drawHistory() {

        // Текущее табло
        const score_player = document.querySelector(SCORE_PLAYER).innerText;
        const score_computer = document.querySelector(SCORE_COMPUTER).innerText;

        // Добавление истории
        document.querySelector('.history').innerHTML += `
            Ничья ${score_player}:${score_computer}<br>
        `;

    }

    /**
     * Логика хода компьютера
     * @returns {Promise<void>}
     */
    async playComputerPlayer() {

        // Пауза
        await new Promise(resolve =>
            setTimeout(() => {
                resolve();
            }, 1000)
        );

        // Получение актуальных элементов
        this.gridCells = this.getGridCells();

        // Поиск свободных позиций
        const availablePositions = this.gridCells.filter((p) => p.innerText === DEFAULT_VALUE);

        // Если все позиции заняты, игра закончилась ничьей
        if (availablePositions.length === 0) {
            // Добавление в историю
            this.drawHistory();
            // Следующая серия
            await this.nextGame();
        } else {

            // Компьютер делает ход на случайную позицию
            const randomPosition = Math.floor(Math.random() * (availablePositions.length));
            availablePositions[randomPosition].innerText = this.currentPlayer.cross ? 'X' : 'O';

            // Обнаружились победные позиции
            if (this.checkWinner()) {
                await this.nextGame();
            } else if (availablePositions.length === 1) {  // либо это является последней не победной позицией
                // Добавление в историю
                this.drawHistory();
                // Следующая серия
                await this.nextGame();
            } else {
                // Ожидание хода для человека
                this.setActivePlayer(this.players[0]);
            }

        }

    }

    /**
     * Изменение состояния текущего игрока
     * @param player {Player} - Экземпляр игрока
     */
    setActivePlayer(player) {

        // Изменение текущего игрока
        this.currentPlayer = player;

        // Очистка предыдущих декораций
        this.clearDecoration();

        // Применение декораций для текущего игрока
        const selector = (player.name === HUMAN_PLAYER) ? BOARD_PLAYER : BOARD_COMPUTER;

        // Нижнее подчеркивание & жирный шрифт
        document.querySelector(selector).style.textDecoration = 'underline';
        document.querySelector(selector).style.fontWeight = 'bold';

    }

    /**
     * Очистка декораций
     */
    clearDecoration() {

        // Удаление нижнего подчеркивания & жирного шрифта для игрока
        document.querySelector(BOARD_PLAYER).style.textDecoration = null;
        document.querySelector(BOARD_PLAYER).style.fontWeight = null;

        // Удаление нижнего подчеркивания & жирного шрифта для компьютера
        document.querySelector(BOARD_COMPUTER).style.textDecoration = null;
        document.querySelector(BOARD_COMPUTER).style.fontWeight = null;

    }

    /**
     * Сброс полей
     */
    clearCells() {

        // Сброс текста на стандартное значение & удаление фонового цвета
        this.gridCells.forEach((element) => {
            element.innerText = DEFAULT_VALUE;
            element.style.backgroundColor = null;
        });

    }

}

const instance = new Game();
