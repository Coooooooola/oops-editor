# EN
The prototype of this editor was written by me during my several weekend breaks. I need to prove that this idea is feasible as quickly as possible, and not be blocked the not so important details.

In general, the reason why this editor is so fast is that I designed the architecture with idea of IOC(inversion of control).

This design can make the features be logically separated from each other. Because the control layer is just a place to express intent, all data update operations propagate to each node of the data layer itself, thus avoiding the shortcomings of logical centralization, that is, logical centralization must be compatible with various possible cases.

Update process:
1. Native event triggered from the view layer
2. The controller converts the original event into user intent and initiates an event at a node in the data layer
3. Traverse all child nodes, call the hook of the node, and update the data of the node itself through the hook
4. When the data is updated, the render function is called to trigger the update operation of the view layer

Data layer performance test method: the idea is to deliberately update each node: initialize 6000 nodes, select all nodes and format bold style. The way to compare with other editors is to construct 6000 nodes, such as normal font and underline interval structure (such as: abc<ins>abc</ins>abc<ins>abc</ins>), and then select all to format bold style.

It's necessary to point out that there is still a lot of room for improvement (and I know the right direction for improvement), but the design principles are correct. It can be proved from the performance and the implementation of this editor.

Also, if you want to implement the document collaboration ability and layout engine, then you still need to do a lot of research and design.

But in fact, not having document collaboration capability or layout engine can already meet most of the needs. It shouldn't be a problem to implement a complete editor based on this architecture. Because if these two capabilities are implemented, it is already a commercial product that can rival Word Online and Google Docs but it's really hard and needs a lot of time investment.

Although it is natural to look at the design of this architecture now, I actually made a lot of choices during the design, such as whether to use batch update, node design, children update method, node traversal method, the most difficult point is that if you have the idea of this architecture. That is, the process from 0 to 1.

In fact, the greater value of this architecture is not in the rich text editor. The data layer can actually represent any view, and the core point of the data layer is how you update from one state to another state. The update logic of the data layer is reflected in this architecture, so it guides a general solution for dealing with complex views.

# 中文

这个编辑器架构原形是我花费自己的几个周末的休息时间写的。我需要尽可能快地证明这个idea是可行的，而不是被一些细枝末节所阻塞。

总的来说，这个编辑器之所以快的原因在于大量使用了控制反转的思想设计架构。

如此设计可以使feature互不干扰，因为控制层只是一个阐述意图的地方，所有的数据更新操作都下沉到数据层的每个节点本身，从而避免了逻辑中心化的缺点，即逻辑中心化必须对各种可能出现的case进行兼容。

更新流程：
1. 来自视图层的原生事件触发
2. controller将原生事件转化为用户意图，开始在数据层某个节点处发起事件
3. 遍历所有节点，调用节点的hook，通过hook对节点本身进行数据更新
4. 更新数据时调用render函数，触发视图层的更新操作

数据层性能的测试方法：本质是故意让每个节点都进行更新，所以初始化6000个节点，全选对其全部加粗操作即可。对比其他编辑器的方法是构造出6000个节点，如正常字体与下划线间隔构造（如：abc<ins>abc</ins>abc<ins>abc</ins>），再全选加粗。

需要指出的是依然有很多可以改进的空间（我知道要改进的方向，因为目前架构的能力还是会有欠缺），但是设计方向是对的，从性能以及我确实实现了这个编辑器可以证明这一点。

还有的是，假如实现协同能力和排版引擎，依然需要做很多的相关研究和设计。

但其实无协同，无排版引擎（专业级别的编辑器需要排版引擎的根本原因在于html+css无法满足高度自定义的文字排版需求）已经能满足绝大部分的需求，基于这个架构去做应该是没问题的（编辑器的选区难点其实是可以解决的，参考腾讯文档或Google docs的做法即可），因为假如实现这两个能力，已经是可以匹敌Google Docs的商业级产品了，需要投入很多人力很多时间去做这件事情。

虽然现在看这个架构的设计是自然而然的，但是期间我其实进行了非常多的抉择，比如是否使用batch update，节点的设计，children的更新方式，节点的遍历方式，其中最难的点在于你有没有这整个架构的idea。即从0到1的过程。

其实这个架构更大的价值不在富文本编辑器。因为数据层实际上是可以表示任意视图的，而数据层的最核心的点在于你如何去从一个状态更新到另一个状态，数据层的更新逻辑在这个架构中都是有体现的，所以它其实指引了一种处理复杂视图的通用解决方案（简单的视图似乎用不到【其实我也不知道，毕竟是从0到1的探索过程，在我面前是一片未知领域hhh】，因为写起来对skill的要求挺高而且挺麻烦，但是复杂视图的渲染不得不这样做，因为要考虑的case太多了，必须对输入输出进行严格的限定，否则代码的复杂度将会与feature的增量呈现快速增长趋势）。

富文本编辑器相关的一些链接：

https://myslide.cn/slides/21863 （我试了一下，其实语雀编辑器性能很差😂）

https://zhuanlan.zhihu.com/p/157215963
