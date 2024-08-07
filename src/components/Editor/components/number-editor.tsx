import { Input } from "@nextui-org/react";
import ReactDOM from "react-dom";

class NumberEditor {
  constructor() {
    this.root = null;
    this.element = null;
    this.container = null;
  }
  onStart(editorContext) {
    const { container, referencePosition, value } = editorContext;
    this.container = container;
    this.createElement(value);
    value && this.setValue(value);
    (null == referencePosition ? void 0 : referencePosition.rect) &&
      this.adjustPosition(referencePosition.rect);
  }

  createElement(defaultValue) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.width = "100%";
    this.container.appendChild(div);
    this.root = ReactDOM.createRoot(div);
    this.root.render(
      <>
        <input
          type="number"
          className="w-full h-full "
          style={{
            textAlign: "right",
            fontSize: "15px",
            outline: "none",
          }}
          defaultValue={defaultValue}
          onChange={(e) => {
            this.currentValue = e.target.value;
          }}
        />
      </>
    );
    this.element = div;
  }

  getValue() {
    return this.currentValue;
  }

  setValue(value) {
    this.currentValue = value;
  }
  isEditorElement(target) {
    // cascader创建时时在cavas后追加一个dom，而popup append在body尾部。不论popup还是dom，都应该被认为是点击到了editor区域
    return this.element.contains(target) || this.isClickPopUp(target);
  }

  isClickPopUp(target) {
    while (target) {
      if (target.classList && target.classList.contains("arco-select")) {
        return true;
      }
      // 如果到达了DOM树的顶部，则停止搜索
      target = target.parentNode;
    }
    // 如果遍历结束也没有找到符合条件的父元素，则返回false
    return false;
  }
  adjustPosition(rect) {
    if (this.element) {
      (this.element.style.top = rect.top + "px"),
        (this.element.style.left = rect.left + "px"),
        (this.element.style.width = rect.width + "px"),
        (this.element.style.height = rect.height + "px");
    }
  }

  onEnd() {
    console.log(this.element);

    this.container.removeChild(this.element);
  }
}

export default NumberEditor;
