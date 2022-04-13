import Notification from "../../src/OrderBug";

Notification.instance({}, () => {
  console.log("call back done!!");
});

export default function App() {
  console.log("APP render");
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
