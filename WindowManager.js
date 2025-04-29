class WindowManager {
	#windows;
	#count;
	#id;
	#winData;
	#winShapeChangeCallback;
	#winChangeCallback;

	constructor() {
		let that = this;

		// Listen for storage changes in *other* tabs/windows
		addEventListener("storage", (event) => {
			if (event.key === "windows") {
				let newWindows = JSON.parse(event.newValue);
				let winChange = that.#didWindowsChange(that.#windows, newWindows);

				that.#windows = newWindows;

				if (winChange && that.#winChangeCallback) {
					that.#winChangeCallback();
				}
			}
		});

		// Handle cleanup on window close
		window.addEventListener("beforeunload", function () {
			let index = that.getWindowIndexFromId(that.#id);

			if (index !== -1) {
				that.#windows.splice(index, 1);

				if (that.#windows.length === 0) {
					localStorage.removeItem("windows");
					localStorage.removeItem("count");
				} else {
					that.updateWindowsLocalStorage();
				}
			}
		});
	}

	// Call this after constructing the object
	init(metaData) {
		this.#windows = JSON.parse(localStorage.getItem("windows")) || [];
		this.#count = parseInt(localStorage.getItem("count")) || 0;

		this.#count++;
		this.#id = this.#count;

		let shape = this.getWinShape();
		this.#winData = { id: this.#id, shape: shape, metaData: metaData };
		this.#windows.push(this.#winData);

		localStorage.setItem("count", this.#count);
		this.updateWindowsLocalStorage();
	}

	#didWindowsChange(pWins, nWins) {
		if (pWins.length !== nWins.length) {
			return true;
		}
		for (let i = 0; i < pWins.length; i++) {
			if (pWins[i].id !== nWins[i].id) return true;
		}
		return false;
	}

	getWinShape() {
		return {
			x: window.screenLeft,
			y: window.screenTop,
			w: window.innerWidth,
			h: window.innerHeight
		};
	}

	getWindowIndexFromId(id) {
		return this.#windows.findIndex(win => win.id === id);
	}

	updateWindowsLocalStorage() {
		localStorage.setItem("windows", JSON.stringify(this.#windows));
	}

	update() {
		let winShape = this.getWinShape();
		let oldShape = this.#winData.shape;

		if (
			winShape.x !== oldShape.x ||
			winShape.y !== oldShape.y ||
			winShape.w !== oldShape.w ||
			winShape.h !== oldShape.h
		) {
			this.#winData.shape = winShape;

			let index = this.getWindowIndexFromId(this.#id);
			if (index !== -1) this.#windows[index].shape = winShape;

			if (this.#winShapeChangeCallback) {
				this.#winShapeChangeCallback();
			}

			this.updateWindowsLocalStorage();
		}
	}

	setWinShapeChangeCallback(callback) {
		this.#winShapeChangeCallback = callback;
	}

	setWinChangeCallback(callback) {
		this.#winChangeCallback = callback;
	}

	getWindows() {
		return this.#windows;
	}

	getThisWindowData() {
		return this.#winData;
	}

	getThisWindowID() {
		return this.#id;
	}
}

export default WindowManager;
