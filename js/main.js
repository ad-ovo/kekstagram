/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(4);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	(function() {
	  /**
	   * @constructor
	   * @param {string} image
	   */
	  var Resizer = function(image) {
	    // Изображение, с которым будет вестись работа.
	    this._image = new Image();
	    this._image.src = image;

	    // Холст.
	    this._container = document.createElement('canvas');
	    this._ctx = this._container.getContext('2d');

	    // Создаем холст только после загрузки изображения.
	    this._image.onload = function() {
	      // Размер холста равен размеру загруженного изображения. Это нужно
	      // для удобства работы с координатами.
	      this._container.width = this._image.naturalWidth;
	      this._container.height = this._image.naturalHeight;

	      /**
	       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
	       * стороны изображения.
	       * @const
	       * @type {number}
	       */
	      var INITIAL_SIDE_RATIO = 0.75;

	      // Размер меньшей стороны изображения.
	      var side = Math.min(
	          this._container.width * INITIAL_SIDE_RATIO,
	          this._container.height * INITIAL_SIDE_RATIO);

	      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
	      // от размера меньшей стороны.
	      this._resizeConstraint = new Square(
	          this._container.width / 2 - side / 2,
	          this._container.height / 2 - side / 2,
	          side);

	      // Отрисовка изначального состояния канваса.
	      this.setConstraint();
	    }.bind(this);

	    // Фиксирование контекста обработчиков.
	    this._onDragStart = this._onDragStart.bind(this);
	    this._onDragEnd = this._onDragEnd.bind(this);
	    this._onDrag = this._onDrag.bind(this);
	  };

	  Resizer.prototype = {
	    /**
	     * Родительский элемент канваса.
	     * @type {Element}
	     * @private
	     */
	    _element: null,

	    /**
	     * Положение курсора в момент перетаскивания. От положения курсора
	     * рассчитывается смещение на которое нужно переместить изображение
	     * за каждую итерацию перетаскивания.
	     * @type {Coordinate}
	     * @private
	     */
	    _cursorPosition: null,

	    /**
	     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
	     * от верхнего левого угла исходного изображения.
	     * @type {Square}
	     * @private
	     */
	    _resizeConstraint: null,

	    /**
	     * Отрисовка канваса.
	     */
	    redraw: function() {
	      // Очистка изображения.
	      this._ctx.clearRect(0, 0, this._container.width, this._container.height);

	      // Параметры линии.
	      // NB! Такие параметры сохраняются на время всего процесса отрисовки
	      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
	      // чего-либо с другой обводкой.

	      // Толщина линии.
	      this._ctx.lineWidth = 6;
	      // Цвет обводки.
	      this._ctx.strokeStyle = '#ffe753';
	      // Размер штрихов. Первый элемент массива задает длину штриха, второй
	      // расстояние между соседними штрихами.
	      this._ctx.setLineDash([15, 10]);
	      // Смещение первого штриха от начала линии.
	      this._ctx.lineDashOffset = 7;

	      // Сохранение состояния канваса.
	      // Подробней см. строку 132.
	      this._ctx.save();

	      // Установка начальной точки системы координат в центр холста.
	      this._ctx.translate(this._container.width / 2, this._container.height / 2);

	      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
	      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
	      // Отрисовка изображения на холсте. Параметры задают изображение, которое
	      // нужно отрисовать и координаты его верхнего левого угла.
	      // Координаты задаются от центра холста.
	      this._ctx.drawImage(this._image, displX, displY);

	      //отрисовка прозрачного черного слоя
	      this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';

	      // отрисовка слоя вверху
	      this._ctx.fillRect(
	          -this._container.width / 2,
	          -this._resizeConstraint.side / 2 - this._ctx.lineWidth,
	          this._container.width,
	          -this._container.height - this._resizeConstraint.side
	      );

	      // отрисовка слоя внизу
	      this._ctx.fillRect(
	          -this._container.width / 2,
	          this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2,
	          this._container.width,
	          this._container.height - this._resizeConstraint.side
	      );

	      // отрисовка слоя слева
	      this._ctx.fillRect(
	          -this._resizeConstraint.side / 2 - this._ctx.lineWidth,
	          -this._resizeConstraint.side / 2 - this._ctx.lineWidth,
	          -this._container.width / 2 - this._resizeConstraint.side / 2,
	          this._resizeConstraint.side + this._ctx.lineWidth / 2
	      );

	      // отрисовка слоя справа
	      this._ctx.fillRect(
	          this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2,
	          -this._resizeConstraint.side / 2 - this._ctx.lineWidth,
	          this._container.width / 2 + this._resizeConstraint.side / 2,
	          this._resizeConstraint.side + this._ctx.lineWidth / 2
	      );

	      // выводит размер изображения
	      this._ctx.font = '18px Arial';
	      this._ctx.textAlign = 'center';
	      this._ctx.fillStyle = '#eaeaea';
	      this._ctx.fillText(
	          this._image.naturalWidth + ' x ' + this._image.naturalHeight,
	          0,
	          -this._resizeConstraint.side / 2 - (this._ctx.lineWidth + 8)
	      );

	      // Отрисовка прямоугольника, обозначающего область изображения после
	      // кадрирования. Координаты задаются от центра.
	      this._ctx.strokeRect(
	          (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	          (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	          this._resizeConstraint.side - this._ctx.lineWidth / 2,
	          this._resizeConstraint.side - this._ctx.lineWidth / 2);

	      // дополнительное задание №1
	      // толщина точки
	      this._ctx.dotWidth = 6;
	      // цвет точки
	      this._ctx.fillStyle = '#ffe753';
	      // количество точек на линии
	      this._ctx.dotQuantity = this._resizeConstraint.side / 2 / this._ctx.dotWidth;

	      // цикл для отрисовки точек на рамке
	      for (var i = 0; i < this._ctx.dotQuantity; i++) {
	        // точки вверху
	        this._ctx.beginPath();
	        this._ctx.arc(
	            -this._resizeConstraint.side / 2 - this._ctx.dotWidth / 2 + this._ctx.dotWidth * i * 2,
	            -this._resizeConstraint.side / 2 - this._ctx.dotWidth / 2,
	            this._ctx.dotWidth / 2,
	            0,
	            2 * Math.PI
	        );
	        this._ctx.fill();

	        // точки снизу
	        this._ctx.beginPath();
	        this._ctx.arc(
	            -this._resizeConstraint.side / 2 - this._ctx.dotWidth / 2 + this._ctx.dotWidth * i * 2,
	            this._resizeConstraint.side / 2 - this._ctx.dotWidth,
	            this._ctx.dotWidth / 2,
	            0,
	            2 * Math.PI
	        );
	        this._ctx.fill();

	        // точки слева
	        this._ctx.beginPath();
	        this._ctx.arc(
	            -this._resizeConstraint.side / 2 - this._ctx.dotWidth / 2,
	            -this._resizeConstraint.side / 2 - this._ctx.dotWidth / 2 + this._ctx.dotWidth * i * 2,
	            this._ctx.dotWidth / 2,
	            0,
	            2 * Math.PI
	        );
	        this._ctx.fill();

	        // точки справа
	        this._ctx.beginPath();
	        this._ctx.arc(
	            this._resizeConstraint.side / 2 - this._ctx.dotWidth,
	            -this._resizeConstraint.side / 2 - this._ctx.dotWidth / 2 + this._ctx.dotWidth * i * 2,
	            this._ctx.dotWidth / 2,
	            0,
	            2 * Math.PI
	        );
	        this._ctx.fill();
	      }


	      // Восстановление состояния канваса, которое было до вызова ctx.save
	      // и последующего изменения системы координат. Нужно для того, чтобы
	      // следующий кадр рисовался с привычной системой координат, где точка
	      // 0 0 находится в левом верхнем углу холста, в противном случае
	      // некорректно сработает даже очистка холста или нужно будет использовать
	      // сложные рассчеты для координат прямоугольника, который нужно очистить.
	      this._ctx.restore();
	    },

	    /**
	     * Включение режима перемещения. Запоминается текущее положение курсора,
	     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
	     * позволяющие перерисовывать изображение по мере перетаскивания.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    _enterDragMode: function(x, y) {
	      this._cursorPosition = new Coordinate(x, y);
	      document.body.addEventListener('mousemove', this._onDrag);
	      document.body.addEventListener('mouseup', this._onDragEnd);
	    },

	    /**
	     * Выключение режима перемещения.
	     * @private
	     */
	    _exitDragMode: function() {
	      this._cursorPosition = null;
	      document.body.removeEventListener('mousemove', this._onDrag);
	      document.body.removeEventListener('mouseup', this._onDragEnd);
	    },

	    /**
	     * Перемещение изображения относительно кадра.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    updatePosition: function(x, y) {
	      this.moveConstraint(
	          this._cursorPosition.x - x,
	          this._cursorPosition.y - y);
	      this._cursorPosition = new Coordinate(x, y);
	    },

	    /**
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDragStart: function(evt) {
	      this._enterDragMode(evt.clientX, evt.clientY);
	    },

	    /**
	     * Обработчик окончания перетаскивания.
	     * @private
	     */
	    _onDragEnd: function() {
	      this._exitDragMode();
	    },

	    /**
	     * Обработчик события перетаскивания.
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDrag: function(evt) {
	      this.updatePosition(evt.clientX, evt.clientY);
	    },

	    /**
	     * Добавление элемента в DOM.
	     * @param {Element} element
	     */
	    setElement: function(element) {
	      if (this._element === element) {
	        return;
	      }

	      this._element = element;
	      this._element.insertBefore(this._container, this._element.firstChild);
	      // Обработчики начала и конца перетаскивания.
	      this._container.addEventListener('mousedown', this._onDragStart);
	    },

	    /**
	     * Возвращает кадрирование элемента.
	     * @return {Square}
	     */
	    getConstraint: function() {
	      return this._resizeConstraint;
	    },

	    /**
	     * Смещает кадрирование на значение указанное в параметрах.
	     * @param {number} deltaX
	     * @param {number} deltaY
	     * @param {number} deltaSide
	     */
	    moveConstraint: function(deltaX, deltaY, deltaSide) {
	      this.setConstraint(
	          this._resizeConstraint.x + (deltaX || 0),
	          this._resizeConstraint.y + (deltaY || 0),
	          this._resizeConstraint.side + (deltaSide || 0));
	    },

	    /**
	     * @param {number} x
	     * @param {number} y
	     * @param {number} side
	     */
	    setConstraint: function(x, y, side) {
	      if (typeof x !== 'undefined') {
	        this._resizeConstraint.x = x;
	      }

	      if (typeof y !== 'undefined') {
	        this._resizeConstraint.y = y;
	      }

	      if (typeof side !== 'undefined') {
	        this._resizeConstraint.side = side;
	      }

	      requestAnimationFrame(function() {
	        this.redraw();
	        window.dispatchEvent(new CustomEvent('resizerchange'));
	      }.bind(this));
	    },

	    /**
	     * Удаление. Убирает контейнер из родительского элемента, убирает
	     * все обработчики событий и убирает ссылки.
	     */
	    remove: function() {
	      this._element.removeChild(this._container);

	      this._container.removeEventListener('mousedown', this._onDragStart);
	      this._container = null;
	    },

	    /**
	     * Экспорт обрезанного изображения как HTMLImageElement и исходником
	     * картинки в src в формате dataURL.
	     * @return {Image}
	     */
	    exportImage: function() {
	      // Создаем Image, с размерами, указанными при кадрировании.
	      var imageToExport = new Image();

	      // Создается новый canvas, по размерам совпадающий с кадрированным
	      // изображением, в него добавляется изображение взятое из канваса
	      // с измененными координатами и сохраняется в dataURL, с помощью метода
	      // toDataURL. Полученный исходный код, записывается в src у ранее
	      // созданного изображения.
	      var temporaryCanvas = document.createElement('canvas');
	      var temporaryCtx = temporaryCanvas.getContext('2d');
	      temporaryCanvas.width = this._resizeConstraint.side;
	      temporaryCanvas.height = this._resizeConstraint.side;
	      temporaryCtx.drawImage(this._image,
	          -this._resizeConstraint.x,
	          -this._resizeConstraint.y);
	      imageToExport.src = temporaryCanvas.toDataURL('image/png');

	      return imageToExport;
	    }
	  };

	  /**
	   * Вспомогательный тип, описывающий квадрат.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @param {number} side
	   * @private
	   */
	  var Square = function(x, y, side) {
	    this.x = x;
	    this.y = y;
	    this.side = side;
	  };

	  /**
	   * Вспомогательный тип, описывающий координату.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  var Coordinate = function(x, y) {
	    this.x = x;
	    this.y = y;
	  };

	  window.Resizer = Resizer;
	})();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* global Resizer: true */

	/**
	 * @fileoverview
	 * @author Igor Alexeenko (o0)
	 */

	'use strict';

	// Подключенная библиотека
	var browserCookies = __webpack_require__(3);

	(function() {
	  /** @enum {string} */
	  var FileType = {
	    'GIF': '',
	    'JPEG': '',
	    'PNG': '',
	    'SVG+XML': ''
	  };

	  /** @enum {number} */
	  var Action = {
	    ERROR: 0,
	    UPLOADING: 1,
	    CUSTOM: 2
	  };

	  /**
	   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
	   * из ключей FileType.
	   * @type {RegExp}
	   */
	  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

	  /**
	   * @type {Object.<string, string>}
	   */
	  var filterMap;

	  /**
	   * Объект, который занимается кадрированием изображения.
	   * @type {Resizer}
	   */
	  var currentResizer;

	  /**
	   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
	   * изображением.
	   */
	  function cleanupResizer() {
	    if (currentResizer) {
	      currentResizer.remove();
	      currentResizer = null;
	    }
	  }

	  /**
	   * Ставит одну из трех случайных картинок на фон формы загрузки.
	   */
	  function updateBackground() {
	    var images = [
	      'img/logo-background-1.jpg',
	      'img/logo-background-2.jpg',
	      'img/logo-background-3.jpg'
	    ];

	    var backgroundElement = document.querySelector('.upload');
	    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
	    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
	  }

	  /**
	   * Проверяет, валидны ли данные, в форме кадрирования.
	   * @return {boolean}
	   */
	  function resizeFormIsValid() {
	    var resizeX = parseInt(resizeFormResizeX.value, 10) || 0;
	    var resizeY = parseInt(resizeFormResizeY.value, 10) || 0;
	    var resizeSize = parseInt(resizeFormResizeSize.value, 10) || 0;
	    var result = true;
	    if (resizeX + resizeSize > currentResizer._image.naturalWidth) {
	      result = false;
	    }
	    if (resizeY + resizeSize > currentResizer._image.naturalHeight) {
	      result = false;
	    }
	    if (resizeY < 0 || resizeX < 0) {
	      result = false;
	    }
	    return result;
	  }
	  /**
	   * Форма загрузки изображения.
	   * @type {HTMLFormElement}
	   */
	  var uploadForm = document.forms['upload-select-image'];

	  /**
	   * Форма кадрирования изображения.
	   * @type {HTMLFormElement}
	   */
	  var resizeForm = document.forms['upload-resize'];
	  var resizeFormResizeX = resizeForm['resize-x'];
	  var resizeFormResizeY = resizeForm['resize-y'];
	  var resizeFormResizeSize = resizeForm['resize-size'];
	  var resizeFwd = resizeForm['resize-fwd'];

	  /**
	   * Форма добавления фильтра.
	   * @type {HTMLFormElement}
	   */
	  var filterForm = document.forms['upload-filter'];

	  /**
	   * @type {HTMLImageElement}
	   */
	  var filterImage = filterForm.querySelector('.filter-image-preview');

	  /**
	   * @type {HTMLElement}
	   */
	  var uploadMessage = document.querySelector('.upload-message');

	  /**
	   * @param {Action} action
	   * @param {string=} message
	   * @return {Element}
	   */
	  function showMessage(action, message) {
	    var isError = false;

	    switch (action) {
	      case Action.UPLOADING:
	        message = message || 'Кексограмим&hellip;';
	        break;

	      case Action.ERROR:
	        isError = true;
	        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
	        break;
	    }

	    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
	    uploadMessage.classList.remove('invisible');
	    uploadMessage.classList.toggle('upload-message-error', isError);
	    return uploadMessage;
	  }

	  function hideMessage() {
	    uploadMessage.classList.add('invisible');
	  }

	  /**
	   * Обработчик изменения изображения в форме загрузки. Если загруженный
	   * файл является изображением, считывается исходник картинки, создается
	   * Resizer с загруженной картинкой, добавляется в форму кадрирования
	   * и показывается форма кадрирования.
	   * @param {Event} evt
	   */
	  uploadForm.addEventListener('change', function(evt) {
	    var element = evt.target;
	    if (element.id === 'upload-file') {
	      // Проверка типа загружаемого файла, тип должен быть изображением
	      // одного из форматов: JPEG, PNG, GIF или SVG.
	      if (fileRegExp.test(element.files[0].type)) {
	        var fileReader = new FileReader();

	        showMessage(Action.UPLOADING);

	        fileReader.onload = function() {
	          cleanupResizer();

	          currentResizer = new Resizer(fileReader.result);
	          currentResizer.setElement(resizeForm);
	          uploadMessage.classList.add('invisible');

	          uploadForm.classList.add('invisible');
	          resizeForm.classList.remove('invisible');

	          hideMessage();
	        };

	        fileReader.readAsDataURL(element.files[0]);
	      } else {
	        // Показ сообщения об ошибке, если загружаемый файл, не является
	        // поддерживаемым изображением.
	        showMessage(Action.ERROR);
	      }
	    }
	  });

	  /**
	   * Обработка валидации формы кадрирования. Если форма валидна, разрешается отправка формы.
	   */
	  resizeForm.addEventListener('change', function() {
	    var resizeInputField = document.querySelectorAll('.upload-resize-controls input');
	    var errorMessage = 'Ошибка! Введенные значения должны быть в пределах загруженного изображения.';
	    var errorNotification = document.createTextNode(errorMessage);

	    if (resizeFormIsValid()) {
	      resizeFwd.removeAttribute('disabled');
	      for (var i = 0; i < resizeInputField.length; i++) {
	        resizeInputField[i].style.border = 'none';
	      }
	    } else {
	      resizeFwd.setAttribute('disabled', true);
	      resizeForm.appendChild(errorNotification);
	      for (var j = 0; j < resizeInputField.length; j++) {
	        resizeInputField[j].style.border = '4px solid #990000';
	      }
	    }
	  });

	  // Обработчик изменений рамки
	  function getNewResizeBorder() {
	    var currentResizeBorder = currentResizer.getConstraint();
	    resizeFormResizeX.value = currentResizeBorder.x;
	    resizeFormResizeY.value = currentResizeBorder.y;
	    resizeFormResizeSize.value = currentResizeBorder.side;
	  }

	  resizeForm.addEventListener('change', function() {
	    currentResizer.setConstraint(+resizeFormResizeX.value, +resizeFormResizeY.value, +resizeFormResizeSize.value);
	    resizeFormIsValid();
	  });

	  window.addEventListener('resizerchange', getNewResizeBorder);

	  /**
	   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
	   * и обновляет фон.
	   * @param {Event} evt
	   */
	  resizeForm.addEventListener('reset', function(evt) {
	    evt.preventDefault();

	    cleanupResizer();
	    updateBackground();

	    resizeForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  });

	  /**
	   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
	   * кропнутое изображение в форму добавления фильтра и показывает ее.
	   * @param {Event} evt
	   */
	  resizeForm.addEventListener('submit', function(evt) {
	    evt.preventDefault();

	    if (resizeFormIsValid()) {
	      filterImage.src = currentResizer.exportImage().src;

	      resizeForm.classList.add('invisible');
	      filterForm.classList.remove('invisible');

	      // Из cookies выбирается фильтр
	      filterImage.className = 'filter-image-preview ' + browserCookies.get('filter');
	      // И устанавливается соответственный input
	      document.getElementById('upload-' + browserCookies.get('filter')).checked = true;
	    }
	  });

	  /**
	   * Сброс формы фильтра. Показывает форму кадрирования.
	   * @param {Event} evt
	   */
	  filterForm.addEventListener('reset', function(evt) {
	    evt.preventDefault();

	    filterForm.classList.add('invisible');
	    resizeForm.classList.remove('invisible');
	  });

	  /**
	   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
	   * записав сохраненный фильтр в cookie.
	   * @param {Event} evt
	   */
	  filterForm.addEventListener('submit', function(evt) {
	    evt.preventDefault();

	    cleanupResizer();
	    updateBackground();

	    filterForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');

	    // переменные для cookies
	    var currentYear = new Date().getFullYear();
	    var myBirthDay = 13;
	    var myBirthMonth = 12;
	    var myLastBirthday = new Date(currentYear, myBirthMonth, myBirthDay);

	    // Проверка года
	    if(myLastBirthday >= Date.now()) {
	      myLastBirthday.setFullYear(currentYear - 1);
	    }
	    // Вычисление срока жизни cookies
	    var expirationDate = new Date(Date.now() + (Date.now() - myLastBirthday)).toUTCString();
	    // Выбор фильтра
	    var lastFilter = filterImage.className.split(' ')[1];
	    // Запись полученного результата в cookies
	    browserCookies.set('filter', lastFilter, { expires: expirationDate });
	  });

	  /**
	   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
	   * выбранному значению в форме.
	   */
	  filterForm.addEventListener('change', function() {
	    if (!filterMap) {
	      // Ленивая инициализация. Объект не создается до тех пор, пока
	      // не понадобится прочитать его в первый раз, а после этого запоминается
	      // навсегда.
	      filterMap = {
	        'none': 'filter-none',
	        'chrome': 'filter-chrome',
	        'sepia': 'filter-sepia'
	      };
	    }

	    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
	      return item.checked;
	    })[0].value;

	    // Класс перезаписывается, а не обновляется через classList потому что нужно
	    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
	    // состояние или просто перезаписывать.
	    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
	  });

	  cleanupResizer();
	  updateBackground();
	})();


/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.defaults = {};

	exports.set = function(name, value, options) {
	  // Retrieve options and defaults
	  var opts = options || {};
	  var defaults = exports.defaults;

	  // Apply default value for unspecified options
	  var expires  = opts.expires || defaults.expires;
	  var domain   = opts.domain  || defaults.domain;
	  var path     = opts.path     != undefined ? opts.path     : (defaults.path != undefined ? defaults.path : '/');
	  var secure   = opts.secure   != undefined ? opts.secure   : defaults.secure;
	  var httponly = opts.httponly != undefined ? opts.httponly : defaults.httponly;

	  // Determine cookie expiration date
	  // If succesful the result will be a valid Date, otherwise it will be an invalid Date or false(ish)
	  var expDate = expires ? new Date(
	      // in case expires is an integer, it should specify the number of days till the cookie expires
	      typeof expires == 'number' ? new Date().getTime() + (expires * 864e5) :
	      // else expires should be either a Date object or in a format recognized by Date.parse()
	      expires
	  ) : '';

	  // Set cookie
	  document.cookie = name.replace(/[^+#$&^`|]/g, encodeURIComponent)                // Encode cookie name
	  .replace('(', '%28')
	  .replace(')', '%29') +
	  '=' + value.replace(/[^+#$&/:<-\[\]-}]/g, encodeURIComponent) +                  // Encode cookie value (RFC6265)
	  (expDate && expDate.getTime() >= 0 ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
	  (domain   ? ';domain=' + domain : '') +                                          // Add domain
	  (path     ? ';path='   + path   : '') +                                          // Add path
	  (secure   ? ';secure'           : '') +                                          // Add secure option
	  (httponly ? ';httponly'         : '');                                           // Add httponly option
	};

	exports.get = function(name) {
	  var cookies = document.cookie.split(';');

	  // Iterate all cookies
	  for(var i = 0; i < cookies.length; i++) {
	    var cookie = cookies[i];
	    var cookieLength = cookie.length;

	    // Determine separator index ("name=value")
	    var separatorIndex = cookie.indexOf('=');

	    // IE<11 emits the equal sign when the cookie value is empty
	    separatorIndex = separatorIndex < 0 ? cookieLength : separatorIndex;

	    // Decode the cookie name and remove any leading/trailing spaces, then compare to the requested cookie name
	    if (decodeURIComponent(cookie.substring(0, separatorIndex).replace(/^\s+|\s+$/g, '')) == name) {
	      return decodeURIComponent(cookie.substring(separatorIndex + 1, cookieLength));
	    }
	  }

	  return null;
	};

	exports.erase = function(name, options) {
	  exports.set(name, '', {
	    expires:  -1,
	    domain:   options && options.domain,
	    path:     options && options.path,
	    secure:   0,
	    httponly: 0}
	  );
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * @fileoverview Фотографии
	 */

	'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(5),
	  __webpack_require__(6),
	  __webpack_require__(7),
	  __webpack_require__(8),
	  __webpack_require__(9)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(filterModule, Filter, getPictures, Gallery, photoModule) {

	  // Прячет блок с фильтрами
	  var filtersContainer = document.querySelector('.filters');
	  filtersContainer.classList.add('hidden');

	  // Переменные для создания элементов на основе шаблона
	  var picturesContainer = document.querySelector('.pictures');

	  /**
	   * @constant
	   * @type {string}
	   */
	  var ACTIVE_FILTER_CLASSNAME = 'picture-filter-active';

	  /** @type {Array} */
	  var pictures = [];

	  /** @type {Array} */
	  var filteredPictures = [];

	  /** @type {Array} */
	  var renderedPictures = [];

	  /**
	   * @constant
	   * @type {number}
	   */
	  var PAGE_SIZE = 12;

	  /** @type {number} */
	  var pageNumber = 0;

	  //Проверка следующей страницы для отрисовки
	  /**
	   * @param pics
	   * @param page
	   * @param pageSize
	   * @returns {boolean}
	   */
	  var isNextPageAvailable = function(pics, page, pageSize) {
	    return page < Math.floor(filteredPictures.length / pageSize);
	  };

	  // Проверка низа страницы
	  /** @returns {boolean} */
	  var isBottomReached = function() {
	    var footerPosition = picturesContainer.getBoundingClientRect();
	    return footerPosition.top - window.innerHeight <= 0;
	  };

	  // Автоматическая отрисовка списка фотографий по достижении низа страницы
	  var setScrollEnabled = function() {
	    var scrollTimeout;

	    window.addEventListener('scroll', function() {
	      clearTimeout(scrollTimeout);
	      scrollTimeout = setTimeout(function() {
	        if (isBottomReached() && isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
	          pageNumber++;
	          renderPictures(filteredPictures, pageNumber);
	        }
	      }, 100);
	    });
	  };

	  // Функция, которая отрисовывает список фотографий
	  /**
	   * @param pics
	   * @param page
	   * @param replace
	   */
	  var renderPictures = function(pics, page, replace) {
	    if (replace) {
	      renderedPictures.forEach(function(picture) {
	        picture.remove();
	      });
	      renderedPictures = [];
	    }

	    var from = page * PAGE_SIZE;
	    var to = from + PAGE_SIZE;
	    var pictureIndex = from - 1;

	    var container = document.createDocumentFragment();

	    // Получение и отрисовка фотографий
	    pics.slice(from, to).forEach(function(picture) {
	      photoModule.getPictureElement(picture);
	      pictureIndex++;
	      renderedPictures.push(new photoModule.Photo(picture, container));
	    });

	    picturesContainer.appendChild(container);


	    // Отрисовка списка фотографий на больших экранах
	    var screenSizeLarge = window.innerHeight - parseFloat(getComputedStyle(picturesContainer).height) > 0;

	    var picturesOnLargeScreen = function() {
	      while (screenSizeLarge && isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
	        pageNumber++;
	        renderPictures(filteredPictures, pageNumber);
	      }
	    };

	    picturesOnLargeScreen();
	  };

	  /** @param filter */
	  var setFilterEnabled = function(filter) {
	    filteredPictures = filterModule.getFilteredPictures(pictures, filter);
	    pageNumber = 0;
	    renderPictures(filteredPictures, pageNumber, true);

	    var activeFilter = filtersContainer.querySelector('.' + ACTIVE_FILTER_CLASSNAME);
	    if (activeFilter) {
	      activeFilter.classList.remove(ACTIVE_FILTER_CLASSNAME);
	    }
	    var filterToActivate = document.getElementById(filter);
	    filterToActivate.classList.add(ACTIVE_FILTER_CLASSNAME);
	    Gallery.setGalleryPictures(filteredPictures);
	  };

	  // Функция, которая обрабатывает клики на элементах фильтра
	  // Делегирование из модуля 6
	  var setFiltrationEnabled = function() {
	    filtersContainer.addEventListener('click', function(evt) {
	      if (evt.target.classList.contains('filters-radio')) {
	        setFilterEnabled(evt.target.id);
	        filterModule.setLastFilterInLocalStorage(evt.target.id);
	      }
	    });
	  };

	  // Функция, которая вызывает отрисовку списка загруженных фотографий
	  getPictures(function(loadedPictures) {
	    pictures = loadedPictures;
	    setFiltrationEnabled(true);
	    setFilterEnabled(filterModule.lastFilter());
	    picturesContainer.classList.remove('pictures-loading');
	    setScrollEnabled();
	    Gallery.onHashChange();
	  });

	  // Отображает блок с фильтрами
	  filtersContainer.classList.remove('hidden');
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * @fileoverview Функция фильтрации списка
	 */
	'use strict';

	// Функция, которая возвращает отфильтрованный список фотографий
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(Filter) {

	  /**
	   * @constant
	   * @type {string}
	   */
	  var DEFAULT_FILTER = Filter.POPULAR;

	  var filtersContainer = document.querySelector('.filters');

	  // Сохранение последнего выбранного фильтра в LocalStorage
	  /** @param filter */
	  var setLastFilterInLocalStorage = function(filter) {
	    localStorage.setItem('filter', filter);
	  };

	  // Получение последнего выбранного фильтра из LocalStorage
	  var getLastFilterFromLocalStorage = function() {
	    return localStorage.getItem('filter');
	  };

	  /**
	   * @returns {string}
	   */
	  var lastFilter = function() {
	    if (localStorage.hasOwnProperty('filter')) {
	      filtersContainer.querySelector('#' + getLastFilterFromLocalStorage()).setAttribute('checked', true);
	      return getLastFilterFromLocalStorage();
	    } else {
	      filtersContainer.querySelector('#' + DEFAULT_FILTER).setAttribute('checked', true);
	      return DEFAULT_FILTER;
	    }
	  };
	    /**
	     * @param {Array.<Object>} pics
	     * @param filter
	     * @return {Array.<Object>}
	     */
	  var getFilteredPictures = function(pics, filter) {
	    var picturesToFilter = pics.slice(0);

	    switch (filter) {
	      case 'filter-popular':
	        break;

	      case 'filter-new':
	        picturesToFilter.filter(function(dateOfPictures) {
	          var dateOfPicture = new Date(dateOfPictures.date);
	          var lastTwoWeeks = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
	          return dateOfPicture > lastTwoWeeks;
	        });
	        picturesToFilter.sort(function(a, b) {
	          var newPicture = new Date(b.date);
	          var oldPicture = new Date(a.date);
	          return newPicture - oldPicture;
	        });
	        break;

	      case 'filter-discussed':
	        picturesToFilter.sort(function(a, b) {
	          return b.comments - a.comments;
	        });
	        break;
	    }
	    return picturesToFilter;
	  };

	  return {
	    getFilteredPictures: getFilteredPictures,
	    setLastFilterInLocalStorage: setLastFilterInLocalStorage,
	    lastFilter: lastFilter
	  };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));



/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * @fileoverview Список доступных видов фильтрации
	 */

	'use strict';

	/** @enum {number} */
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	  return {
	    'POPULAR': 'filter-popular',
	    'NEW': 'filter-new',
	    'DISCUSSED': 'filter-discussed'
	  };
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * @fileoverview Загрузка данных
	 */

	'use strict';

	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	  return function(callback) {
	    var picturesContainer = document.querySelector('.pictures');
	    var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';
	    var xhr = new XMLHttpRequest();

	      /** @param evt */
	    xhr.onload = function(evt) {
	      picturesContainer.classList.add('pictures-loading');
	      var loadedData = JSON.parse(evt.target.response);
	      callback(loadedData);
	    };

	    xhr.timeout = 10000;
	    xhr.onerror = xhr.ontimeout = function() {
	      picturesContainer.classList.remove('pictures-loading');
	      picturesContainer.classList.add('pictures-failure');
	    };

	    xhr.open('GET', PICTURES_LOAD_URL);
	    xhr.send();
	  };
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 *@fileoverview  Компоненты фотогаллереи
	 */

	'use strict';

	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	  function Gallery() {

	    this.galleryContainer = document.querySelector('.gallery-overlay');
	    this.galleryClose = this.galleryContainer.querySelector('.gallery-overlay-close');
	    this.galleryImage = this.galleryContainer.querySelector('.gallery-overlay-image');
	    this.galleryLikes = this.galleryContainer.querySelector('.likes-count');
	    this.galleryComments = this.galleryContainer.querySelector('.comments-count');

	    /** @type {Array.<string>} */
	    this.galleryPictures = [];

	    /** @type {number} */
	    this.activePicture = 0;

	    /**
	     * @constant
	     * @type {RegExp}
	     */
	    this.REGULAR_EXPRESSION = new RegExp(/#photo\/(\S+)/);

	    /** @type {string} */
	    this.activeHash = window.location.hash;

	    window.addEventListener('hashchange', this.onHashChange.bind(this));

	    this._onCloseClickHandler = this._onCloseClickHandler.bind(this);
	    this._onPhotoClick = this._onPhotoClick.bind(this);
	    this._onGalleryOverlayClick = this._onGalleryOverlayClick.bind(this);
	    this._onDocumentKeydownHandler = this._onDocumentKeydownHandler.bind(this);
	    this.showPicture = this.showPicture.bind(this);
	    this.showNextPicture = this.showNextPicture.bind(this);
	    this.hideGallery = this.hideGallery.bind(this);
	    this.showGallery = this.showGallery.bind(this);
	    this.setGalleryPictures = this.setGalleryPictures.bind(this);
	    this.onHashChange = this.onHashChange.bind(this);
	  }

	  /**
	   * @param {MouseEvent} evt
	   */
	  Gallery.prototype._onCloseClickHandler = function(evt) {
	    if (evt.target === this.galleryClose) {
	      evt.preventDefault();
	      this.hideGallery();
	    }
	  };

	  /**
	   * @param {MouseEvent} evt
	   */
	  Gallery.prototype._onPhotoClick = function(evt) {
	    evt.preventDefault();
	    this.showNextPicture();
	  };

	  /**
	   * @param {MouseEvent} evt
	   */
	  Gallery.prototype._onGalleryOverlayClick = function(evt) {
	    if (evt.target !== this.galleryImage && evt.target !== this.galleryClose) {
	      evt.preventDefault();
	      this.hideGallery();
	    }
	  };

	  /**
	   * @param {KeyboardEvent} evt
	   */
	  Gallery.prototype._onDocumentKeydownHandler = function(evt) {
	    if (event.keyCode === 27) {
	      evt.preventDefault();
	      this.hideGallery();
	    }
	  };

	  /** @function showPicture */
	  Gallery.prototype.showPicture = function(pictureHash) {
	    var picture = this.galleryPictures[this.activePicture];

	    if (pictureHash) {
	      picture = this.galleryPictures.find(function(pic) {
	        return pic.url === pictureHash[1];
	      });
	    } else {
	      picture = this.galleryPictures[this.activePicture];
	    }
	    this.activePicture = this.galleryPictures.indexOf(picture);

	    this.galleryImage.src = picture.url;

	    this.galleryLikes.textContent = picture.likes;
	    this.galleryComments.textContent = picture.comments;
	  };

	  /** @function showNextPicture */
	  Gallery.prototype.showNextPicture = function() {
	    if (this.activePicture <= this.galleryPictures.length) {
	      this.activePicture++;
	      window.location.hash = '#photo/' + this.galleryPictures[this.activePicture].url;
	    }
	  };

	  /** @function hideGallery*/
	  Gallery.prototype.hideGallery = function() {
	    window.location.hash = '';

	    this.galleryContainer.classList.add('invisible');

	    this.galleryImage.removeEventListener('click', this._onPhotoClick);
	    document.removeEventListener('keydown', this._onDocumentKeydownHandler);
	    this.galleryClose.removeEventListener('click', this._onCloseClickHandler);
	    this.galleryContainer.removeEventListener('click', this._onGalleryOverlayClick);
	  };

	  /** @param pictureHash */
	  Gallery.prototype.showGallery = function(pictureHash) {
	    this.galleryContainer.classList.remove('invisible');

	    this.galleryImage.addEventListener('click', this._onPhotoClick);
	    document.addEventListener('keydown', this._onDocumentKeydownHandler);
	    this.galleryClose.addEventListener('click', this._onCloseClickHandler);
	    this.galleryContainer.addEventListener('click', this._onGalleryOverlayClick);

	    this.showPicture(pictureHash);
	  };

	  /**
	   * @param {Array.<pictures>} pictures
	   */
	  Gallery.prototype.setGalleryPictures = function(pictures) {
	    this.galleryPictures = pictures;
	  };

	  // Проверку хэша страницы
	  Gallery.prototype.onHashChange = function() {
	    this.activeHash = window.location.hash.match(this.REGULAR_EXPRESSION);
	    if (this.activeHash) {
	      this.showGallery(this.activeHash);
	    } else {
	      this.hideGallery();
	    }
	  };

	  return new Gallery();
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * @fileoverview Отрисовка фотографии
	 */

	'use strict';

	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	  /**
	   * @constructor
	   * @param picture
	   * @param container
	   */
	  function Photo(picture, container) {

	    this.picture = picture;
	    this.element = getPictureElement(picture);

	    this._onPhotoClick = (function(evt) {
	      evt.preventDefault();
	      window.location.hash = '#photo/' + this.picture.url;
	    }).bind(this);

	    this.remove = function() {
	      this.element.removeEventListener('click', this._onPhotoClick);
	      this.element.parentNode.removeChild(this.element);
	    };

	    this.element.addEventListener('click', this._onPhotoClick);
	    container.appendChild(this.element);
	  }

	  /**
	   * @constant
	   * @type {number}
	   */
	  var PICTURE_LOAD_TIMEOUT = 10000;

	  /** @type {Element} */
	  var templateElement = document.getElementById('picture-template');
	  var elementToClone;

	  // Поддержка тега template
	  if ('content' in templateElement) {
	    elementToClone = templateElement.content.querySelector('.picture');
	  } else {
	    elementToClone = templateElement.querySelector('.picture');
	  }


	  /**
	   *
	   * @param picture
	   * @returns {Node}
	   */
	  // Функция, которая создает элемент и добавляет его на страницу
	  function getPictureElement(picture) {
	    var element = elementToClone.cloneNode(true);

	    // Создание изображений
	    var image = element.querySelector('img');
	    element.querySelector('.picture-comments').textContent = picture.comments;
	    element.querySelector('.picture-likes').textContent = picture.likes;
	    var imageElement = new Image(182, 182);

	    // Обработчик загрузки
	    imageElement.onload = function() {
	      clearTimeout(imageLoadTimeout);
	      image.setAttribute('src', picture.url);
	    };

	    // Обработчик ошибки
	    imageElement.onerror = function() {
	      image.classList.add('picture-load-failure');
	    };

	    imageElement.src = picture.url;

	    var imageLoadTimeout = setTimeout(function() {
	      image.src = '';
	      image.classList.add('picture-load-failure');
	    }, PICTURE_LOAD_TIMEOUT);

	    return element;
	  }

	  return {
	    Photo: Photo,
	    getPictureElement: getPictureElement
	  };
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }
/******/ ]);