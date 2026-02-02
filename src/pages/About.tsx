import "./About.css";

export default function About() {
    return (
        <main className="about">
            <section className="aboutText">
                <h1>Speed &amp; Structure Exploring Modern Sorting Algorithms</h1>

                <details className="drop" open>
                    <summary className="drop__title">Why Does Sorting Matter?</summary>
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/whySortingmatters.jpeg" alt="Why Sorting Matters" />
                    </aside>
                    <p>Organizing data systematically (ascending or descending order).</p>

                    <h4>Real-World Applications</h4>
                    <ul>
                        <li>Databases (search efficiency)</li>
                        <li>E-commerce (sorting products by price, ratings)</li>
                        <li>File systems (organized storage/retrieval)</li>
                        <li>Analytics and reports (meaningful visualization)</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/fundamentalsofalgorithmanalysis.png" alt="Fundamentals of Algorithm Analysis" />
                    </aside>
                    <summary className="drop__title">Fundamentals of Algorithm Analysis</summary>
                    <ul>
                        <li>Big O Notation (best, average, worst-case)</li>
                        <li>Importance of understanding growth rate.</li>
                        <li>Additional memory requirements during sorting.</li>
                        <li>Order of equal elements maintained or changed.</li>
                        <li>Memory usage implications</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/classificationofsorts.png" alt="Classification Of Sorts" />
                    </aside>
                    <summary className="drop__title">Classification Of Sorts</summary>

                    <h4>Comparison-Based Sorting</h4>
                    <ul>
                        <li>Bubble Sort, Insertion Sort, Merge Sort, Heap Sort.</li>
                    </ul>

                    <h4>Non-Comparison Sorting</h4>
                    <ul>
                        <li>Counting Sort, Radix Sort, Bucket Sort</li>
                    </ul>

                    <h4>Categories Explained</h4>
                    <ul>
                        <li>Simple vs Complex Algorithms</li>
                        <li>Internal vs External sorting (memory constraints)</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/simpleComparisonSorts.png" alt="Simple Comparison Sorts" />
                    </aside>
                    <summary className="drop__title">Simple Comparison Sorts</summary>

                    <h4>Insertion Sort</h4>
                    <ul>
                        <li>Key idea: builds sorted array incrementally.</li>
                        <li>Complexity: O(n²), good for small datasets.</li>
                    </ul>

                    <h4>Bubble Sort</h4>
                    <ul>
                        <li>Key idea: repeatedly swaps adjacent elements if out of order.</li>
                        <li>Complexity: O(n²), usually least efficient.</li>
                    </ul>

                    <h4>Selection Sort</h4>
                    <ul>
                        <li>Key idea: repeatedly selects minimum element.</li>
                        <li>Complexity: O(n²), performs poorly with large data sets.</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/quicksort.png" alt="Quick Sort" />
                    </aside>
                    <summary className="drop__title">Quick Sort</summary>

                    <h4>Partition-based Sorting</h4>
                    <ul>
                        <li>Picks pivot, partitions array, recursively sorts partitions.</li>
                    </ul>

                    <h4>Complexity</h4>
                    <ul>
                        <li>Best/Average: O(n log n), Worst: O(n²) (rarely occurs)</li>
                    </ul>

                    <h4>Pros/Cons</h4>
                    <ul>
                        <li>Fastest in practice due to cache-friendly operations</li>
                        <li>Sensitive to pivot selection (randomized pivot choice helps)</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/mergesort.png" alt="Merge Sort" />
                    </aside>
                    <summary className="drop__title">Merge Sort</summary>

                    <h4>Divide and Conquer Approach</h4>
                    <ul>
                        <li>Splits data recursively, then merges sorted lists.</li>
                    </ul>

                    <h4>Complexity</h4>
                    <ul>
                        <li>Best/Worst/Average: O(n log n)</li>
                    </ul>

                    <h4>Stability</h4>
                    <ul>
                        <li>Stable, but requires additional memory (not in-place)</li>
                    </ul>

                    <h4>Pros/Cons</h4>
                    <ul>
                        <li>Predictable performance, good for large datasets</li>
                        <li>Higher memory usage than Quick/Heap sorts.</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/nonComparisonSorts.png" alt="Non-Comparison Sorts" />
                    </aside>
                    <summary className="drop__title">Non-Comparison Sorts</summary>

                    <h4>Counting Sort</h4>
                    <ul>
                        <li>Counting occurrences, cumulative frequency distribution</li>
                        <li>Complexity: O(n + k) where k is range of data.</li>
                    </ul>

                    <h4>Radix Sort</h4>
                    <ul>
                        <li>Sorts digit-by-digit (least significant to most significant)</li>
                        <li>Complexity: O(nk), effective for numeric/string data</li>
                    </ul>

                    <h4>Bucket Sort</h4>
                    <ul>
                        <li>Divides data into buckets, sorts buckets individually.</li>
                        <li>Complexity: O(n + k), efficient for uniformly distributed data.</li>
                    </ul>

                    <h4>When to Use</h4>
                    <ul>
                        <li>Data type specific scenarios, known range or limited version.</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/performanceComparison.png" alt="Performance Comparison" />
                    </aside>
                    <summary className="drop__title">Performance Comparison</summary>

                    <h4>Comparison Table</h4>
                    <ul>
                        <li>Clearly compare time complexity (best, average, worst cases)</li>
                        <li>Memory usage (space complexity)</li>
                        <li>Stability and practical use-cases.</li>
                    </ul>

                    <h4>Graphs/Visualizations</h4>
                    <ul>
                        <li>Graphical Visualization of complexity curves (n vs n² vs n log n)</li>
                        <li>No sorting algorithm uses more space than time.</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/handsOnDemo.jpg" alt="Hands-on Demo / Visualization" />
                    </aside>
                    <summary className="drop__title">Hands-on Demo / Visualization</summary>

                    <h4>Interactive Visualization Tools</h4>
                    <ul>
                        <li>Demonstrate sorting visually (e.g., using your sorting visualizer)</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/choosingTheRightSort.png" alt="Choosing The Right Sort" />
                    </aside>
                    <summary className="drop__title">Choosing The Right Sort</summary>

                    <h4>Considerations</h4>
                    <ul>
                        <li>Dataset size (small vs large)</li>
                        <li>Data nature (mostly sorted, random, reverse order)</li>
                        <li>Memory availability (low-memory constraints)</li>
                        <li>Stability requirements</li>
                    </ul>

                    <h4>Decision Tree or Flowchart</h4>
                    <ul>
                        <li>Provide visual aids to help determine best algorithm based on given parameters.</li>
                    </ul>
                </details>

                <details className="drop">
                    <aside className="aboutImageWrap">
                        <img className="aboutImage" src="/practicalUseInIndustry.png" alt="Practical Use In Industry" />
                    </aside>
                    <summary className="drop__title">Practical Use In Industry</summary>

                    <h4>Databases and Indexing</h4>
                    <ul>
                        <li>Quick Sort, Heap Sort used in efficient data retrieval.</li>
                    </ul>

                    <h4>Financial Industry</h4>
                    <ul>
                        <li>High-Frequency trading (sorting transactions rapidly)</li>
                    </ul>

                    <h4>E-Commerce</h4>
                    <ul>
                        <li>Sorting products quickly based on user preferences</li>
                        <li>Task scheduling (priority queue, heap-based implementation)</li>
                    </ul>
                </details>
                <div className="copyright">
                    <p>Copyright &#169; 2026 Artyom Simitian. All Rights Reserved</p>
                </div>
            </section>
        </main>
    );
}
