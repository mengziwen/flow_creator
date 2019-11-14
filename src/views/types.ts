
export class Status{
	constructor(x:number,y:number) {
		this.id=Math.random().toString().substr(2)+ Date.now();
		this.x = x;
		this.y = y;
		this.width = 80;
		this.height = 80;
		this.name = '双击编辑';
		this.type= '';
		this.level=0;
		this.parent='';
		this.child=[];

	}
	id:string;
	x: number;
	y: number;
	width: number;
	height: number;
	name:string;
	type:string;
	level:number;
	parent:string;
	child:[];
}

export class Line {
	constructor() {
		this.id=Math.random().toString().substr(2)+ Date.now();
		this.x1 = 0;
		this.y1 = 0;
		this.x2 = 0;
		this.y2 = 0;
		this.from = {};
		this.to = {};
		this.name = '双击编辑';
		this.parentId='';
	}
	id:string;
	//起始块左上角相对位移比例
	x1: number;
	y1: number;
	//终点块左上角相对位移比例
	x2: number;
	y2: number;
	//起始块
	from: any;
	//终点块
	to: any;
	name:string;
	parentId:string;
}