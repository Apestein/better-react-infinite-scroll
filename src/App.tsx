import "./App.css"
import InfiniteScroller from "../package/index"

function App() {
  const elements = [1, 2, 3, 4, 5]

  return (
    <>
      <div>
        <h1>test</h1>
        <InfiniteScroller
          fetchNextPage={() => {
            console.log("fetched next page")
          }}
          hasNextPage={true}
          loadingMessage={<p>Loading...</p>}
          endingMessage={<p>The beginning of time...</p>}
        >
          {elements.map((el) => (
            <li>{el}</li>
          ))}
        </InfiniteScroller>
      </div>
    </>
  )
}

export default App
