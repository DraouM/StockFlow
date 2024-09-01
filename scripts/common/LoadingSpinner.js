class LoadingSpinner {
  constructor(targetId, options = {}) {
    this.target = document.getElementById(targetId);
    this.options = {
      message: "Loading...",
      spinnerClass: "spinner",
      ...options,
    };
    this.spinnerElement = null;
  }

  show() {
    if (!this.spinnerElement) {
      this.spinnerElement = document.createElement("div");
      this.spinnerElement.className = this.options.spinnerClass;

      const spinnerText = document.createElement("p");
      spinnerText.textContent = this.options.message;
      this.spinnerElement.appendChild(spinnerText);

      this.target.appendChild(this.spinnerElement);
    }

    this.spinnerElement.style.display = "block";
  }

  hide() {
    if (this.spinnerElement) {
      this.spinnerElement.style.display = "none";
    }
  }
}
