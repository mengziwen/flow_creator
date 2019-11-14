<template>
	<div class="home">
		<div class="form-box">
			<a-button type="primary" @click="addRect">添加状态</a-button>
		</div>
		<div ref="main" class="svg">
			<svg  xmlns="http://www.w3.org/2000/svg" id="main" version="1.1" width="100%" height="100%" ref="svg">
				<!-- 块 -->
				<rect v-for="(rectItem, index) in state.rectArray" :key="rectItem.id" :ref="'rect' + index"
					style="fill:white;stroke-width:1;stroke:rgb(0,0,0);opacity:0.8;" @mousedown="rectMousedown(rectItem, index)" 
					@mousemove="rectMouseMove(rectItem, index)"
					@dblclick="editRect(rectItem, index)"
					:x="rectItem.x" :y="rectItem.y" :width="rectItem.width" :height="rectItem.height" />
				<!-- 块上文字 -->
				<text v-for="(rectItem, index) in state.rectArray" :key="rectItem.id + '_rect_text'" 
					:x="rectItem.x + 10" :y="rectItem.y + 23" @dblclick="editRect(rectItem, index)">
					{{rectItem.name}}
				</text>
				<!-- 临时线 -->
				<line :x1="state.line.x1" :y1="state.line.y1" :x2="state.line.x2" :y2="state.line.y2"
					style="stroke:grey;stroke-width:3"/>
				<!-- 连线 -->
				<line v-for="lineItem in state.lineArray" :key="lineItem.id"  
					:x1="lineItem.from.x + lineItem.x1 * lineItem.from.width" 
					:y1="lineItem.from.y + lineItem.y1 * lineItem.from.height" 
					:x2="lineItem.to.x + lineItem.x2 * lineItem.to.width" 
					:y2="lineItem.to.y + lineItem.y2 * lineItem.to.height"
					style="stroke:grey;stroke-width:3"/>
				<!-- 连线圆点 -->
				<circle v-for="(lineItem,index) in state.lineArray" :key="lineItem.id + '_circle'" 
					@mousedown="circleMousedown(lineItem, index)"
					:cx="lineItem.from.x + lineItem.x1 * lineItem.from.width" 
					:cy="lineItem.from.y + lineItem.y1 * lineItem.from.height" r="4" 
					stroke="black" stroke-width="1" fill="white"/>
				<!-- 连线箭头 -->
				<path v-for="(lineItem, index) in state.lineArray" :key="lineItem.id + '_path'" 
					@mousedown="pathMousedown(lineItem, index)"
					:d="arrowPath({
						x1:lineItem.from.x + lineItem.x1 * lineItem.from.width, 
						y1:lineItem.from.y + lineItem.y1 * lineItem.from.height,
						x2:lineItem.to.x + lineItem.x2 * lineItem.to.width, 
						y2:lineItem.to.y + lineItem.y2 * lineItem.to.height})"/>
				<!-- 线文字 -->
				<text v-for="(lineItem, index) in state.lineArray" :key="lineItem.id + '_line_text'" 
					@dblclick="editLine(lineItem, index)" 
					:x="(lineItem.from.x + lineItem.x1 * lineItem.from.width + lineItem.to.x + lineItem.x2 * lineItem.to.width) / 2 - 30" 
					:y="(lineItem.from.y + lineItem.y1 * lineItem.from.height + lineItem.to.y + lineItem.y2 * lineItem.to.height) / 2 - 5" >
					{{lineItem.name}}
				</text>
			</svg>
		</div>

		<a-modal title="详情" v-model="state.rectEdit" @ok="saveRect">
			<div id="rectDetail">
				<div class="flex line">
					<div class="textRight">状态名称：</div>
					<div class="flex4">
						<a-input v-model="state.editingRect.rect.name"/>
					</div>
				</div>
				
			</div>
		</a-modal>
		<a-modal title="详情" v-model="state.lineEdit" @ok="saveLine">
			<a-input v-model="state.editingLine.line.name" placeholder="事件名称"/>
		</a-modal>
	</div>
</template>

<script lang='ts'>
import {Vue, Component} from 'vue-property-decorator'
import {Status, Line} from './types'

@Component
export default class Index extends Vue {
	public state: any = {
		
		//方块数组
		rectArray: [],
		//方块编辑状态
		rectEdit: false,
		//方块缩放状态
		rectDraw: '',
		//线编辑状态
		lineEdit: false,
		//编辑用方块
		editingRect: {
			//-1为新建
			index: -1,
			rect:{}
		},
		//编辑用线段
		editingLine: {
			//-1为新建
			index:-1,
			line:{}
		},
		//拖动用临时线段
		line: new Line(),
		//线数组
		lineArray: [],
		//移动用点击位置相对块左上角偏移量
		point: {
			x: 0,
			y: 0
		},
	}
	//临时记录方块数组
	public temporaryRectArray:Status[] = [];
	
	public mounted() {
		let arr = [];
		arr.push(new Status(20, 20));
		arr.push(new Status(180, 20));
		arr.push(new Status(350, 20));
		this.state.rectArray = arr;
	}
	public addRect(){
		let rect: Status = new Status(20 + this.state.rectArray.length * 5, 20 + this.state.rectArray.length * 5);
		this.state.rectArray.push(rect);
	}
	public editRect(rect: Status, index: number){
		this.state.editingRect.index = index;
		this.state.editingRect.rect = {...rect};
		this.state.rectEdit = true;
	}
	public editLine(line:Line, index:number){
		this.state.editingLine.index = index;
		this.state.editingLine.line.name = line.name;
		this.state.lineEdit = true;
	}
	public saveRect() {
		this.state.rectArray[this.state.editingRect.index].name = this.state.editingRect.rect.name;
		this.state.rectEdit = false;
	}
	public saveLine(){
		if (!this.state.editingLine.line.name) {
			return this.$message.error('名称不能为空');
		}
		this.state.lineArray[this.state.editingLine.index].name = this.state.editingLine.line.name;
		this.state.lineEdit = false;
	}
	
	//块交互相关
	public rectMousedown(rect:Status,index:number){
		let event: any = window.event;
		//左键
		if(event.buttons == 1){
			this.state.editingRect.index = index;
			this.state.editingRect.rect = {...rect};
			this.temporaryRectArray = JSON.parse(JSON.stringify(this.state.rectArray));
			if(event.srcElement.style.cursor == 'pointer'){
				this.state.point.x = event.offsetX - rect.x;
				this.state.point.y = event.offsetY - rect.y;
				document.body.addEventListener('mousemove', this.rectLmousemove);
				document.body.addEventListener('mouseup', this.rectLmouseup);
			}else{
				this.state.rectDraw = event.srcElement.style.cursor;
				let svg: any = this.$refs['svg']
				svg.style.cursor = this.state.rectDraw;
				document.body.addEventListener('mousemove', this.rectmousemove);
				document.body.addEventListener('mouseup', this.rectmouseup);
			}
		//右键
		}else{
			const from = this.checkLocation(event.offsetX,event.offsetY);
			if(from != null){
				this.state.line.x1 = event.offsetX;
				this.state.line.y1 = event.offsetY;
				this.state.line.x2 = event.offsetX;
				this.state.line.y2 = event.offsetY;
				this.state.line.from = from;
				document.body.addEventListener('mousemove', this.rectRmousemove);
				document.body.addEventListener('mouseup', this.rectRmouseup);
			}
		}
	}
	//方块移动
	public rectLmousemove(event: any){
		let rect = this.state.rectArray[this.state.editingRect.index];
		//先算移动的量
		let x = event.offsetX - this.state.point.x - rect.x;
		let y = event.offsetY - this.state.point.y - rect.y;
		rect.x = event.offsetX - this.state.point.x;
		rect.y = event.offsetY - this.state.point.y;
		//递归移动子节点
		this.moveChild(x, y, rect);
	}
	//方块移动抬起
	public rectLmouseup(event: any){
		let dragRect = this.state.rectArray[this.state.editingRect.index];
		//递归所有子节点配置关系
		if(!this.relationship(dragRect)){
			for(let i = 0; i < this.state.rectArray.length; i++){
				this.state.rectArray[i].x = this.temporaryRectArray[i].x;
				this.state.rectArray[i].y = this.temporaryRectArray[i].y;
			}
		};
		//根据level排序
		this.state.rectArray.sort((a: Status, b: Status)=>{
			return a.level - b.level;
		})
		console.log(this.state.rectArray)
		document.body.removeEventListener('mousemove', this.rectLmousemove);
		document.body.removeEventListener('mouseup', this.rectLmouseup);
	}
	//递归移动子块
	public moveChild(x: number, y: number, prect: Status){
		for(let rect of this.state.rectArray){
			if(rect.parent == prect.id){
				rect.x += x;
				rect.y += y;
				this.moveChild(x, y, rect);
			}
		}
	}
	//移动或缩放后配置父子关系，包括验证重叠
	public relationship(dragRect: Status){
		let parentRect: any = null;
		let childRect = [];
		for(let rect of this.state.rectArray){
			if(dragRect.id == rect.id)continue;
			let i = 0;//移动块是否在其他块内部
			let j = 0;//移动块是否包含其他块
			if(this.pointInRect(dragRect.x, dragRect.y, rect))i++;
			if(this.pointInRect(dragRect.x + dragRect.width, dragRect.y, rect))i++;
			if(this.pointInRect(dragRect.x + dragRect.width, dragRect.y + dragRect.height,rect))i++;
			if(this.pointInRect(dragRect.x, dragRect.y + dragRect.height, rect))i++;

			if(this.pointInRect(rect.x, rect.y, dragRect))j++;
			if(this.pointInRect(rect.x + rect.width,rect.y, dragRect))j++;
			if(this.pointInRect(rect.x + rect.width,rect.y + rect.height, dragRect))j++;
			if(this.pointInRect(rect.x, rect.y + rect.height, dragRect))j++;
			if((i > 0 && i < 4) || (j > 0 && j < 4)){
				return false;
			}
			if(i == 4){
				if(parentRect == null || parentRect.level < rect.level){
					parentRect = rect;
				}
			}
			if(j == 4){
				if(childRect.length == 0){
					childRect.push(rect);
				}else{
					if(childRect[0].level > rect.level){
						childRect = [];
						childRect.push(rect);
					}else if(childRect[0].level == rect.level){
						childRect.push(rect);
					}
				}
			}
		}
		//拖动缩放后变成了子节点
		if(parentRect == null){
			dragRect.level = 0;
			dragRect.parent = '';
		}else{
			dragRect.level = parentRect.level + 1;
			dragRect.parent = parentRect.id;
		}
		//拖动缩放后变成了父节点
		if(childRect.length != 0){
			for(let rect of childRect){
				rect.parent = dragRect.id;
				rect.level = dragRect.level + 1;
			}
		}
		//递归处理子节点
		for(let rect of this.state.rectArray){
			if(dragRect.id == rect.parent){
				if(!this.relationship(rect)){
					return false;
				};
			}
		}
		return true;
	}
	//缩放拖动
	public rectmousemove(event: any){
		let rect = this.state.rectArray[this.state.editingRect.index];
		switch(this.state.rectDraw){
			case 'n-resize':
				rect.height = rect.y + rect.height - event.offsetY;
				rect.y = event.offsetY;
				break;
			case 'e-resize':
				rect.width = event.offsetX - rect.x;
				break;
			case 's-resize':
				rect.height = event.offsetY - rect.y;
				break;
			case 'w-resize':
				rect.width = rect.x+rect.width - event.offsetX;
				rect.x = event.offsetX;
				break;
			case 'ne-resize':
				rect.height = rect.y + rect.height - event.offsetY;
				rect.width = event.offsetX - rect.x;
				rect.y = event.offsetY;
				break;
			case 'se-resize':
				rect.height = event.offsetY - rect.y;
				rect.width = event.offsetX - rect.x;
				break;
			case 'sw-resize':
				rect.height = event.offsetY - rect.y;
				rect.width = rect.x + rect.width - event.offsetX;
				rect.x = event.offsetX;
				break;
			case 'nw-resize':
				rect.height = rect.y + rect.height - event.offsetY;
				rect.y = event.offsetY;
				rect.width = rect.x + rect.width - event.offsetX;
				rect.x = event.offsetX;
				break;
		}
	}
	//缩放抬起
	public rectmouseup(event: any){
		this.state.rectDraw = '';
		let svg:any = this.$refs['svg'];
		svg.style.cursor = 'auto';
		let dragRect = this.state.rectArray[this.state.editingRect.index];
		//递归所有子节点配置关系
		if(!this.relationship(dragRect)){
			for(let i = 0; i < this.state.rectArray.length; i++){
				this.state.rectArray[i].x = this.temporaryRectArray[i].x;
				this.state.rectArray[i].y = this.temporaryRectArray[i].y;
				this.state.rectArray[i].width = this.temporaryRectArray[i].width;
				this.state.rectArray[i].height = this.temporaryRectArray[i].height;
			}
		};
		//根据level排序
		this.state.rectArray.sort((a: Status, b: Status)=>{
			return a.level - b.level;
		})
		document.body.removeEventListener('mousemove', this.rectmousemove);
		document.body.removeEventListener('mouseup', this.rectmouseup);
	}
	//悬浮样式
	public rectMouseMove(rect: Status, index: number){
		if(this.state.rectDraw)return;
		let event: any = window.event;
		//依次为点击位置相距上右下左的距离
		const a = event.offsetY - rect.y;
		const b = rect.x + rect.width - event.offsetX;
		const c = rect.y + rect.height - event.offsetY;
		const d = event.offsetX - rect.x;
		
		let rectDom: any = this.$refs['rect' + index];
		if(a < 5 && b < 5){
			rectDom[0].style.cursor = 'ne-resize';
		}else if(b < 5 && c < 5){
			rectDom[0].style.cursor = 'se-resize';
		}else if(c < 5 && d < 5){
			rectDom[0].style.cursor = 'sw-resize';
		}else if(d < 5 && a < 5){
			rectDom[0].style.cursor = 'nw-resize';
		}else if(a < 5){
			rectDom[0].style.cursor = 'n-resize';
		}else if(b < 5){
			rectDom[0].style.cursor = 'e-resize';
		}else if(c < 5){
			rectDom[0].style.cursor = 's-resize';
		}else if(d < 5){
			rectDom[0].style.cursor = 'w-resize';
		}else{
			rectDom[0].style.cursor = 'pointer';
		}
		
	}
	//连线移动
	public rectRmousemove(event: any){
		this.state.line.x2 = event.offsetX;
		this.state.line.y2 = event.offsetY;
	}
	//连线抬起
	public rectRmouseup(event: any){
		const rect = this.checkLocation(event.offsetX, event.offsetY);
		if(rect != null){
			this.state.line.to = rect;
			let spoint: any = this.computePoint(this.state.line.from, this.state.line.x1, this.state.line.y1)
			let epoint: any = this.computePoint(rect,event.offsetX, event.offsetY);
			this.state.line.x1 = (spoint.x - this.state.line.from.x) / this.state.line.from.width;
			this.state.line.y1 = (spoint.y - this.state.line.from.y) / this.state.line.from.height;
			this.state.line.x2 = (epoint.x - this.state.line.to.x) / this.state.line.to.width;
			this.state.line.y2 = (epoint.y - this.state.line.to.y) / this.state.line.to.height;
			this.state.lineArray.push({...this.state.line});
			this.state.line = new Line();
		}
		this.state.line=new Line();
		document.body.removeEventListener('mousemove', this.rectRmousemove);
		document.body.removeEventListener('mouseup', this.rectRmouseup);
	}
	//画箭头
	public arrowPath(line: any){
		let pointA: any = {};
		let pointB: any = {};
		let angle = Math.atan2(line.y2 - line.y1, line.x1 - line.x2);
		pointA.x = line.x2 + parseFloat((10 * Math.cos(angle + 0.25 * Math.PI)).toFixed(2));
		pointA.y = line.y2 - parseFloat((10 * Math.sin(angle + 0.25 * Math.PI)).toFixed(2));
		pointB.x = line.x2 + parseFloat((10 * Math.cos(angle - 0.25 * Math.PI)).toFixed(2));
		pointB.y = line.y2 - parseFloat((10 * Math.sin(angle - 0.25 * Math.PI)).toFixed(2));

		return 'M ' + line.x2 + ' ' + line.y2 
			+ ' L ' + pointA.x + ' ' + pointA.y
			+ ' L ' + pointB.x + ' ' + pointB.y;
	}
	//移动圆圈相关
	public circleMousedown(line: Line,index: number){
		let event: any = window.event;
		this.state.editingLine.index = index;
		this.state.editingLine.line = {...line};
		document.body.addEventListener('mousemove', this.circleMousemove);
		document.body.addEventListener('mouseup', this.circleMouseup);
	}
	//拖动圆圈移动
	public circleMousemove(event: any){
		let line = this.state.lineArray[this.state.editingLine.index];
		line.x1 = (event.offsetX-line.from.x) / line.from.width;
		line.y1 = (event.offsetY-line.from.y) / line.from.height;
	}
	//拖动圆圈抬起
	public circleMouseup(event: any){
		const rect = this.checkLocation(event.offsetX, event.offsetY);
		if(rect != null){
			let line = this.state.lineArray[this.state.editingLine.index]; 
			line.from = rect;
			let spoint: any = this.computePoint(rect,event.offsetX, event.offsetY);
			line.x1 = (spoint.x-line.from.x) / line.from.width;
			line.y1 = (spoint.y-line.from.y) / line.from.height;
		}else{
			this.$set(this.state.lineArray, this.state.editingLine.index, {...this.state.editingLine.line});
		}
		document.body.removeEventListener('mousemove', this.circleMousemove);
		document.body.removeEventListener('mouseup', this.circleMouseup);
	} 
	//箭头移动相关
	public pathMousedown(line: Line, index: number){
		let event:any = window.event;
		this.state.editingLine.index = index;
		this.state.editingLine.line = {...line};
		document.body.addEventListener('mousemove', this.pathMousemove);
		document.body.addEventListener('mouseup', this.pathMouseup);
	}
	//拖动箭头移动
	public pathMousemove(event: any){
		let line = this.state.lineArray[this.state.editingLine.index];
		line.x2 = (event.offsetX - line.to.x) / line.to.width;
		line.y2 = (event.offsetY - line.to.y) / line.to.height;
	}
	//拖动箭头抬起
	public pathMouseup(event: any){
		const rect = this.checkLocation(event.offsetX, event.offsetY);
		if(rect != null){
			let line = this.state.lineArray[this.state.editingLine.index]; 
			line.to = rect;
			let epoint: any = this.computePoint(rect, event.offsetX, event.offsetY);
			line.x2 = (epoint.x - line.to.x) / line.to.width;
			line.y2 = (epoint.y - line.to.y) / line.to.height;
		}else{
			this.$set(this.state.lineArray, this.state.editingLine.index, {...this.state.editingLine.line});
		}
		document.body.removeEventListener('mousemove', this.pathMousemove);
		document.body.removeEventListener('mouseup', this.pathMouseup);
	} 
	
	//获取点击位置最近的边缘位置
	public computePoint(rect: Status, x: number,y: number){
		//依次为点击位置相距上右下左的距离
		const a = y - rect.y;
		const b = rect.x + rect.width - x;
		const c = rect.y + rect.height -y;
		const d = x - rect.x;
		if(a <= b && a <= c && a <= d){
			return {x: x, y: rect.y};
		}else if(b <= c && b <= d){
			return {x: rect.x + rect.width, y: y};
		}else if(c<=d){
			return {x: x, y: rect.y + rect.height};
		}else{
			return {x: rect.x, y: y};
		}
	}
	//检查点是否在方块内部
	public pointInRect(x: number, y: number, rect: Status){
		return rect.x < x && x < rect.x + rect.width && rect.y < y && y < rect.y + rect.height;
	}
	//检查点击位置在哪个方块内部
	public checkLocation(x: number, y: number){
		let resRect: any=null;
		for (const element of this.state.rectArray) {
			if(this.pointInRect(x, y, element)){
				if(resRect == null || resRect.level < element.level){
					resRect = element;
				}
			}
		}
		return resRect;
	}
}
</script>
<style lang="less">
#rectDetail{
	.line{
		line-height: 32px;
		margin: 5px;
		.icon{
			position: relative;
			left: 10px;
			color: red;
		}
		.select{
			width:100%;
			margin-bottom: 5px;
		}
		.plusButton{
			position: relative;
			left: 5px;
		}
	}
}
.home{
  height: 100%;
	text-align: left;
	display: flex;
	flex-direction: column;
	
	.lay-boxs{
		position: relative;
		width: 300px;
	}
	.svg{
		flex: 1;
	}
}
</style>
