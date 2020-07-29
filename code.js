/*
	Tarun, Dhruv, Jack
	2020-06-17
	Code.js
	Contains the code for the chess game
*/

/***********************************
************************************
TREE CLASS: Houses the custom data 
structure we made to store the branches 
and paths that the computer can take. 
It also has the minimax traversal 
method to find the optimal
************************************
************************************/
class Tree {
	constructor(piece=null, score=null) {
		this.piece=piece;
		this.score=score;
		this.children=[];
	} //End of constructor method.
	/***********************************
	************************************
	MINIMAX METHOD: Recursive function 
	that traverses the tree to find the 
	best move for the AI
	************************************
	************************************/
	minimax(depth, player) {
		if (depth==0) return this.score; //When the recursive function hits a leaf node.
		if (player) { //Maximizing player
			let maximum=Number.NEGATIVE_INFINITY; //Set the greatest possible number currently to the smallest number.
			let evaluation=0;
			for (let i=0; i<this.children.length; i++) { //Loop through each of the child nodes
				evaluation=this.children[i].minimax(depth-1, !player); //Calculate the score of the next child.
				maximum=Math.max(maximum, evaluation); //Find the maximum between current and new evaluation.
			}
			this.score=maximum;
			return maximum; //Return the maxmimum
		}
		else { //Minimizing Player
			let minimum=Number.POSITIVE_INFINITY; //Set the smallest possible number currently to the greater number.
			let evaluation=0;
			for (let i=0; i<this.children.length; i++) { //Loop through each of the child nodes
				evaluation=this.children[i].minimax(depth-1, !player); //Calculate the score of the next child.
				minimum=Math.min(minimum, evaluation); //Find the minimum between current and new evaluation.
			}
			this.score=minimum;
			return minimum; //Return the minimum
		}
	} //End of minimax method
}
/***********************************
************************************
AI CLASS: Houses the custom data 
methods required for the functioning
of the AI, including visulize, move, 
and score.
************************************
************************************/
class AI {
	/***********************************
	************************************
	VISUALIZE METHOD: Recusive function 
	that calculates all the possible 
	branches of moves to a certain depth.
	************************************
	************************************/
	visualize(board, depth=1, tree, side) {
		let newBoard;
		let moves;
		let piece;
		let oldX;
		let oldY;
		let node;
		if (depth==0) return 0; //Base case (When depth is 0, we do not need to analyze any deeper)
		board.visualize(board.isWhite) //Get all moves for the player (Switch later)
		for (let i=0; i<8; i++) { //Loop through the columns on the board
			for (let j=0;j<8; j++) { //Loop through the rows on the board
				if (board.positions[i][j]) { //Check if a piece exists
					piece=board.positions[i][j];
					if (piece.isWhite==board.isWhite) { //Check if the piece's colour is the current player's colour. If it is, then we can move it.
						if (piece.moves.length!=0) { //Check if it can move to another location. If it can, move it and call the recursive function again.
							moves=board.positions[i][j].moves;
							for (let k=0; k<moves.length; k++) { //Loop through all its possible moves.
								//Clone the board and piece.
								newBoard = _.cloneDeep(board);
								piece=newBoard.positions[i][j];
								moves=newBoard.positions[i][j].moves;
								//Move the piece from the old location to the new location
								newBoard.positions[piece.y][piece.x]=undefined;
								newBoard.positions[moves[k][1]][moves[k][0]]=piece;
								piece.x=moves[k][0];
								piece.y=moves[k][1];	
								piece.firstMove=false; //Set the "first move" property to false
								node= (depth==1) ? new Tree(piece, this.score(newBoard, side)) : new Tree(piece); //Score if depth==1, else don't score
								tree.children.push(node); //Enter the new board state into the tree		 				
								newBoard.isWhite=!newBoard.isWhite; //Switch player
								this.visualize(newBoard, depth-1, node, side); //Call the function with the new board
							}
						}	
					}									
				}
			}
		}
		return tree; //Return the tree of all moves to a certain depth.
	}
	/***********************************
	************************************
	SCORE METHOD: Scores each board. 
	Scores each board to determine the 
	best path.
	************************************
	************************************/
	score(board, side) {
		let score=0;
		let piece;
		let s=1;
		for (let i=0; i<8; i++) { //Loop through all the column and rows of the board.
			for (let j=0; j<8; j++) {
				if (board.positions[i][j]) {
					piece=board.positions[i][j];
					s=(piece.isWhite==side) ? 1: -1; //If the piece is opponent, then we must add negative points
					if (piece instanceof Pawn) score+=10*s; //Each pawn is 10 points
					else if (piece instanceof Rook) score+=50*s; //Each rook is 50 points
					else if (piece instanceof Knight) score+=30*s; //Each knight is 30 points
					else if (piece instanceof Bishop) score+=30*s; //Each bishop is 30 points
					else if (piece instanceof King) score+=900*s; //Each king is 900 points
					else if (piece instanceof Queen) score+=100*s; //Each queen is 100 points			
				}
			}
		}
		return score; //Return the score of that board.
	}
	/***********************************
	************************************
	MOVE METHOD: A method that facilitates
	the movement of the AI. The visualize 
	and minimax methods are called internally.
	************************************
	************************************/
	move(board) {
		let tree;
		let possibleMoves=[];
		let newPiece;
		let oldPiece;
		let optimal;
		let piece;
		let flag=0;
		tree=this.visualize(board, difficulty, new Tree(), board.isWhite); //Get the tree of moves
		optimal=tree.minimax(difficulty, true); //Find the optimal move out of the tree
		for (let i=0; i<tree.children.length; i++) { //Loop through the tree to find which moves yield the optimal score.
			if (tree.children[i].score==optimal) possibleMoves.push(tree.children[i].piece); //Push the move if it is optimal.
		}
		newPiece=_.sample(possibleMoves) //Pick a random move if multiple moves have the optimal score.
		oldPiece=board.get(newPiece.id); //Locate the old piece.
		if (board.positions[newPiece.y][newPiece.x]) board.captured.push(board.positions[newPiece.y][newPiece.x]); //Put captured piece in graveyard if it exists.
		board.positions[oldPiece.y][oldPiece.x]=undefined; //Remove old piece
		board.positions[newPiece.y][newPiece.x]=newPiece; //Set new piece
		if (newPiece instanceof Pawn) { //If it was a pawn, it can promote
			if (newPiece.y==7 || newPiece.y==0) { //If the AI's pawn is at the end, it can promote for a queen.
				board.positions[newPiece.y][newPiece.x]=new Queen(newPiece.id, newPiece.x, newPiece.y, false, 'bq.png');
			}
		}
		soundEffect.play();
		soundEffect.currentTime=0;
		board.isWhite=!board.isWhite; //Switch colors
		board.drawPieces(); //Update the pieces on the board
		board.visualize(board.isWhite); //Visualize for opposite colour
		board.get("wk1").castle(board); 
		transcript.push(`<tr><td>${transcript.length+1}</td><td>${newPiece.id}</td><td>${oldPiece.x}, ${oldPiece.y}</td><td>${newPiece.x}, ${newPiece.y}</td></tr>`); //Push the move made into transcript
		if (board.isCheckmate()) displayEndScreen(`Computer WINS. ${name} LOSES.`); //Checks if the next player was checkmated by previous player.
		else board.move(); //If not in checkmate, let the next player move.
	}
}
/***********************************
************************************
PIECE CLASS: Stores methods for every
piece uses, like isLegal, highlight, 
etc.
************************************
************************************/
class Piece { 
	moves=[]; //Stores the moves the piece can move to.
	firstMove=true; //Boolean value tracking if this is the first move of the piece.
	constructor(id, x, y, isWhite, image) {
		this.id=id
		this.x=x;
		this.y=y;
		this.isWhite=isWhite;
		this.image=image;
	} //End of constructor
	/***********************************
	************************************
	isLegal Method: This method checks if
	a move made was legal.
	************************************
	************************************/
	isLegal(newX, newY) {
		for (let i=0; i<this.moves.length; i++) { //Loop through all possible moves
			if (this.moves[i][0]==newX && this.moves[i][1]==newY) return true; //Return true of the move exists
		}
		return false; //Else, return false.
	} //End of isLegal method
	/***********************************
	************************************
	highlight Method: This method highlights
	possible moves.
	************************************
	************************************/
	highlight() {
		for (let i=0; i<this.moves.length; i++) { //Loop through all moves
			$("#"+this.moves[i][0]+this.moves[i][1]).css({"display":"block"}); //Add green circle to that box.
		}
	} //End of highlight method
	/***********************************
	************************************
	willCheck Method: This method moves 
	a piece to the new suggested location 
	and checks if that move results in 
	check for its king.
	************************************
	************************************/
	willCheck(board, newX, newY) {
		let newBoard = _.cloneDeep(board); //Deep clone the board
		let newPiece = _.cloneDeep(this); //Deep clone the piece
		let x=newPiece.x; //Store current x location of the piece
		let y=newPiece.y; //Store current y coordinate of the piece
		newBoard.positions[y][x]=undefined; //Remove piece from old location
		newBoard.positions[newY][newX]=newPiece; //Move piece to new location
		newBoard.positions[newY][newX].x=newX; //Change the x coordinate property on the piece
		newBoard.positions[newY][newX].y=newY; //Change the y coordinate propery on the piece
 		return newBoard.isCheck(); //Return true if this causes check. Return false if it is safe.
	} //End of willCheck
}
/***********************************
************************************
PAWN SUB-CLASS: Includes specific methods 
related to the pawn's movement 
(diagonal attacks, 2 moves at start, 
1 straight move, etc).
************************************
************************************/
class Pawn extends Piece {
	constructor(id,x, y, isWhite, image) {
		super(id, x, y, isWhite, image);
	}
	/***********************************
	************************************
	visualize method: This method finds 
	all possible moves for the pawn.
	************************************
	************************************/
	visualize(board, check) {
		this.moves=[]; //Reset all its possible moves (from the previous turn)
		let x=this.x; //Store the x location of the piece (in a shorter variable)
		let y=this.y; //Store the y location of the piece (in a shorter variable)
		let flag=false; //Boolean storing of square infront is empty.
		if (y==0 || y==7) return;//If the pawn has reached the end of the board, dont' let it go furthur
		this.isWhite ? y-=1:y+=1; //Check if the piece is white or black. White pieces move up the board, while black pieces move down the board.
		if (!board.positions[y][x]) { //Check if 1 spot directly infront if empty.
			flag=1;
			if (check) { //Allow the move if it doesn't result in the king being placed in check.
				if (!this.willCheck(board, x, y)) this.moves.push([x, y]);
			}
			else this.moves.push([x, y]);
			
		}
		for (let i=-1; i<2; i+=2) { //2 diagonal moves (-1 for left, 1 for right)
			if (board.positions[y][x+i]) { //Check if their is piece diagonal to the pawn.
				if (this.isWhite!=board.positions[y][x+i].isWhite) {  //If a piece does exist, check if it an enemy piece
					if (check) { //Allow the move if it doesn't result in the king being placed in check.
						if (!this.willCheck(board, x+i, y)) this.moves.push([x+i, y]);
					}
					else this.moves.push([x+i, y]);					
				}
			}			
		}
		if (flag && this.firstMove) { //On the first turn of a pawn, it can move 2 spaces forward
			this.isWhite ? y-=1:y+=1; //Check if the piece is white or black. White pieces move up the board, while black pieces move down the board.
			if (!board.positions[y][x]) { //Check if spot is empty
				if (check) { //Allow the move if it doesn't result in the king being placed in check.
					if (!this.willCheck(board, x, y)) this.moves.push([x, y]);
				}
				else this.moves.push([x, y]);
			}
		}
	} //End of visualize method
}
/***********************************
************************************
ROOK SUB-CLASS: Includes specific 
methods related to the rook's movement.
************************************
************************************/
class Rook extends Piece {
	constructor(id,x, y, isWhite, image) {
		super(id, x, y, isWhite, image)
	}
	/***********************************
	************************************
	visualize method: This method finds 
	all possible moves for the rook.
	************************************
	************************************/
	visualize(board, check) {
		this.moves=[]; //Reset all its possible moves (from previous turn)
		let x=this.x;  //Store x location of piece.
		let y=this.y; //Store y location of piece.
		for (let s=-1; s<=1; s+=2) { //Inverts the direction
 			for (let i=1; i<8; i++) { //Forward (and backwards)
				if (board.isBoundary(x, y+(i*s))) { //Check if the location is in boundaries
					if (!board.positions[y+(i*s)][x]) { //Check if the box is empty
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x, y+(i*s))) this.moves.push([x, y+(i*s)]); 
						}
						else this.moves.push([x, y+(i*s)]);
					}
					else if (board.positions[y+(i*s)][x].isWhite!=this.isWhite) { //Check if box is occupied by an enenmy
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x, y+(i*s))) this.moves.push([x, y+(i*s)]);
						}
						else this.moves.push([x, y+(i*s)]);				
						break;
					}
					else break; //If it is occupied by its teammate, break.
				}
				else break; //If not in boundaries, break.
			}
			for (let i=1; i<8; i++) { //Left (or right)
				if (board.isBoundary(x+(i*s), y)) { //Check if the location is in boundaries
					if (!board.positions[y][x+(i*s)]) { //Check if the box is empty
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x+(i*s), y)) this.moves.push([x+(i*s), y]);
						}
						else this.moves.push([x+(i*s), y]);
					}
					else if (board.positions[y][x+(i*s)].isWhite!=this.isWhite) { //Check if box is occupied by an enenmy
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x+(i*s), y)) this.moves.push([x+(i*s), y]);
						}
						else this.moves.push([x+(i*s), y]);
						break;
					}
					else break; //If it is occupied by its teammate, break.
				}
				else break; //If not in boundaries, break.
			} 
		}		
	} //End of visualize function
}
/***********************************
************************************
KNIGHT SUB-CLASS: Class that has all 
properties of the Piece class, but 
includes specific methods related to 
the knight's movement.
************************************
************************************/
class Knight extends Piece {
	constructor(id,x, y, isWhite, image) {
		super(id, x, y, isWhite, image)
	}
	/***********************************
	************************************
	visualize method: This method finds 
	all possible moves for the knight.
	************************************
	************************************/
	visualize(board, check) {
		this.moves=[]; //Reset all its possible moves (from previous turn)
		let x=this.x; //Store x location of piece.
		let y=this.y; //Store y location of piece.
		let arr=[[2, 1], [1, 2], [2, -1], [-1, 2], [-2, -1], [-1, -2], [-2, 1], [1, -2]] //All possible delta movements for the knight
		for (let i=0; i<8; i++) { //Loop through all delta movements
			if (board.isBoundary(x+arr[i][0], y+arr[i][1])) { //Check if the move is in boundaries
				if (!board.positions[y+arr[i][1]][x+arr[i][0]]) { //If the box is empty
					if (check) { //Allow the move if it doesn't result in the king being placed in check.
						if (!this.willCheck(board, x+arr[i][0], y+arr[i][1])) this.moves.push([x+arr[i][0], y+arr[i][1]]);
					}
					else this.moves.push([x+arr[i][0], y+arr[i][1]]);
				}
				else if (board.positions[y+arr[i][1]][x+arr[i][0]].isWhite!=this.isWhite) { //If the box is occupied by an enemy
					if (check) { //Allow the move if it doesn't result in the king being placed in check.
						if (!this.willCheck(board, x+arr[i][0], y+arr[i][1]))this.moves.push([x+arr[i][0], y+arr[i][1]]);
					}
					else this.moves.push([x+arr[i][0], y+arr[i][1]]);
				}
			}
		}
	}
}
/***********************************
************************************
BISHOP SUB-CLASS: Class that has all 
properties of the Piece class, but 
includes specific methods related to 
the bishop's movement.
************************************
************************************/
class Bishop extends Piece {
	constructor(id,x, y, isWhite, image) {
		super(id, x, y, isWhite, image)
	}
	/***********************************
	************************************
	visualize method: This method finds 
	all possible moves for the bishop.
	************************************
	************************************/
	visualize(board, check) {
		this.moves=[]; //Reset all its possible moves (from previous turn)
		let x=this.x; //Store x location of piece.
		let y=this.y; //Store y location of piece.
		for (let sx=-1; sx<=1; sx+=2) { //Inverts y
			for (let sy=-1; sy<=1; sy+=2) { //Inverts x
				for (let i=1, j=1; i<8; i++, j++) { //Loop through the diagonal
					if (board.isBoundary(x+(i*sx), y+(j*sy))) {//Check if it is in boundary
						if (!board.positions[y+(j*sy)][x+(i*sx)]) { //If the box is empty...
							if (check) { //If we need to check if the king can be placed in check, check for check, then push into moves array
								if (!this.willCheck(board, x+(i*sx), y+(j*sy))) this.moves.push([x+(i*sx), y+(j*sy)]); //Allow the move if it doesn't result in the king being placed in check.
							}
							else this.moves.push([x+(i*sx), y+(j*sy)]);	//Else, push into moves array without checking if it results in check.				
						}
						else if (board.positions[y+(j*sy)][x+(i*sx)].isWhite!=this.isWhite) { //If the box is occupied by opponent...
							if (check) { //If we need to check if the king can be placed in check, check, then push into moves array
								if (!this.willCheck(board,x+(i*sx), y+(j*sy))) this.moves.push([x+(i*sx), y+(j*sy)]); //Allow the move if it doesn't result in the king being placed in check.
							}
							else this.moves.push([x+(i*sx), y+(j*sy)]);	//Else, push into moves array without checking if it results in check.									
							break;
						}
						else break; //If it is occupied by its teammate, break.
					}
					else break; //If not in boundaries, break.
				}				
			}
		}
	} //End of visualize method.
}
/***********************************
************************************
QUEEN SUB-CLASS: Class that has all 
properties of the Piece class, but 
includes specific methods related to
the queen's movement.
************************************
************************************/
class Queen extends Piece {
	constructor(id,x, y, isWhite, image) {
		super(id, x, y, isWhite, image)
	}
	/***********************************
	************************************
	visualize method: This method finds 
	all possible moves for the queen.
	************************************
	************************************/
	visualize(board, check) {
		//Bishop Logics (Diagonal movement only)
		this.moves=[]; //Reset all its possible moves from previous turns
		let x=this.x; //Store x location of piece.
		let y=this.y; //Store y location of piece.
		for (let sx=-1; sx<=1; sx+=2) { //Inverts y
			for (let sy=-1; sy<=1; sy+=2) { //Invert x
				for (let i=1, j=1; i<8; i++, j++) { //Loop through the diagona
					if (board.isBoundary(x+(i*sx), y+(j*sy))) {//Check if it is in boundary
						if (!board.positions[y+(j*sy)][x+(i*sx)]) { //If the box is empty
							if (check) { //Allow the move if it doesn't result in the king being placed in check.
								if (!this.willCheck(board, x+(i*sx), y+(j*sy))) this.moves.push([x+(i*sx), y+(j*sy)]);
							}
							else this.moves.push([x+(i*sx), y+(j*sy)]);					
						}
						else if (board.positions[y+(j*sy)][x+(i*sx)].isWhite!=this.isWhite) { //If the box is occupied by opponent
							if (check) { //Allow the move if it doesn't result in the king being placed in check.
								if (!this.willCheck(board,x+(i*sx), y+(j*sy))) this.moves.push([x+(i*sx), y+(j*sy)]);
							}
							else this.moves.push([x+(i*sx), y+(j*sy)]);						
							break;
						}
						else break; //If it is occupied by its teammate, break.
					}
					else break; //If not in boundaries, break.
				}				
			}
		}
		//Rook logics (Straight movemenet only)
		for (let s=-1; s<=1; s+=2) { //Inverts the direction
 			for (let i=1; i<8; i++) { //Forward (and backwards)
				if (board.isBoundary(x, y+(i*s))) { //Check if the location is in boundaries
					if (!board.positions[y+(i*s)][x]) { //Check if the box is empty
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x, y+(i*s))) this.moves.push([x, y+(i*s)]); 
						}
						else this.moves.push([x, y+(i*s)]);
					}
					else if (board.positions[y+(i*s)][x].isWhite!=this.isWhite) { //Check if box is occupied by an enenmy
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x, y+(i*s))) this.moves.push([x, y+(i*s)]);
						}
						else this.moves.push([x, y+(i*s)]);				
						break;
					}
					else break; //If it is occupied by its teammate, break.
				}
				else break; //If not in boundaries, break.
			}
			for (let i=1; i<8; i++) { //Left (or right)
				if (board.isBoundary(x+(i*s), y)) { //Check if the location is in boundaries
					if (!board.positions[y][x+(i*s)]) { //Check if the box is empty
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x+(i*s), y)) this.moves.push([x+(i*s), y]);
						}
						else this.moves.push([x+(i*s), y]);
					}
					else if (board.positions[y][x+(i*s)].isWhite!=this.isWhite) { //Check if box is occupied by an enenmy
						if (check) { //Allow the move if it doesn't result in the king being placed in check.
							if (!this.willCheck(board, x+(i*s), y)) this.moves.push([x+(i*s), y]);
						}
						else this.moves.push([x+(i*s), y]);
						break;
					}
					else break; //If it is occupied by its teammate, break.
				}
				else break; //If not in boundaries, break.
			} 
		}	
	} //end of visualize method.
}
/***********************************
************************************
KING SUB-CLASS: Class that has all 
properties of the Piece class, but 
includes specific methods related to
the king's movement.
************************************
************************************/
class King extends Piece {
	/* Need to implement castling */
	castleShort=false;
	castleLong=false;
	constructor(id, x, y, isWhite, image) {
		super(id, x, y, isWhite, image)
	}
	/***********************************
	************************************
	visualize method: This method finds 
	all possible moves for the king.
	************************************
	************************************/
	visualize(board, check) {
		this.moves=[]; //Reset all its possible moves from previous turns
		let x=this.x; //Store x location of piece.
		let y=this.y; //Store y location of piece.
		let newX=0; //Stores the new x coordinate
		let newY=0; //Stores the new y coordinate
		let newBoard; //Store the newBoard 
		let arr=[[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]; //All possible delta movements for the knight
		for (let i=0; i<8; i++) { //Loops through the delta movements
			newX=x+arr[i][0]; //Set the new x coordinate to the old x coordinate + the delta x value
			newY=y+arr[i][1]; //Set the new y coordinate to the old x coordinate + the delta x value
			if (board.isBoundary(newX, newY)) { //Check if the new coordinates are in bounds	
				if (!board.positions[newY][newX]) { //Check if this box is empty
					if (check) { //Allow the move if it doesn't result in the king being placed in check.
						if (!this.willCheck(board, newX, newY)) this.moves.push([newX, newY]); 
					}
					else this.moves.push([newX, newY]);
				} 
				else if (board.positions[newY][newX].isWhite!=this.isWhite) {  //Check if this box is occupied by an enenmy
					if (check) { //Allow the move if it doesn't result in the king being placed in check.
						if (!this.willCheck(board, newX, newY)) this.moves.push([newX, newY]);;
					}
					else this.moves.push([newX, newY]);					
				}
			}
		} 	
	} //End of visualize method
	/***********************************
	************************************
	castle method: Checks if the is in 
	the state to castle king can castle.
	************************************
	************************************/
	castle(board) {
		let rook;
		if (this.firstMove) {
			if (board.isWhite) { //For white
				//Right Side - Short
				rook = board.get("wr2");
				if (rook.firstMove) { //Check if they exist and are at first move.
					if (!board.positions[7][5] && !board.positions[7][6]) { //Check if boxes inbetween are empty.
						if (!this.willCheck(board, 6, 7)) {
							this.castleShort=true;
							this.moves.push([6, 7])
						}
					}
				}
				//Left Side - Long
				rook = board.get("wr1");
				if (rook.firstMove) {
					if (!board.positions[7][1] && !board.positions[7][2] && !board.positions[7][3]) {
						if (!this.willCheck(board, 2, 7)) {
							this.castleLong=true;
							this.moves.push([2, 7])
						}
					}
				}
			}
			else { //For black
				//Right Side - Short
				rook = board.get("br2");
				if (rook.firstMove) { //Check if they exist and are at first move.
					if (!board.positions[0][5] && !board.positions[0][6]) { //Check if boxes inbetween are empty.
						if (!this.willCheck(board, 6, 0)) {
							this.castleShort=true;
							this.moves.push([6, 0])
						}
					}
				}
				//Left Side - Long
				rook = board.get("br1");
				if (rook.firstMove) {
					if (!board.positions[0][1] && !board.positions[0][2] && !board.positions[0][3]) {
						if (!this.willCheck(board, 2, 0)) {
							this.castleLong=true;
							this.moves.push([2, 0])
						}
					}
				}
			}			
		}	
	} //End of castle method.
}
/***********************************
************************************
GAME CLASS: A general class that stores 
methods related to user-input on the 
game. It calls functions in other clases.
************************************
************************************/
class Game {
	isWhite=true; //Stores which player's turn it is (True = White, False = Black)
	/***********************************
	************************************
	USE OF ARRAYS: The positions and captured
	arrays are significant as the entire 
	game depends on the positions of each piece.
	************************************
	************************************/
	positions=[ //Stores all the pieces in the game and its location in the chess board.
		[], //1st row
		[], //2nd row
		[], //3rd row
		[], //4th row
		[], //5th row
		[], //6th row
		[], //7th row
		[], //8th row
	];
	captured=[] //Stores all captured pieces.
	/***********************************
	************************************
	get method: This method returns a pointer 
	to a piece based on an ID. The method 
	returns -1 if not found.
	************************************
	************************************/
	get(pieceId) { 
		for (let i=0; i<8; i++) { //Loop through columns of the board
			for (let j=0; j<8; j++) { //Loop through rows of the board
				if (this.positions[i][j]) { //Check if the piece exists
					if (this.positions[i][j].id==pieceId) return this.positions[i][j]; //Check if ID of piece is the one required.
				}
			} 
		}
		return -1; //Return -1 if the piece does not exist on the board.
	} //End of get method
	/***********************************
	************************************
	start method: This method draws the 
	checkered board and sets up all the 
	pieces.
	************************************
	************************************/
	start() { 
		//Draw the board
		let canvas = document.getElementById("chessBoard"); //Stores the canvas.
		let ctx = canvas.getContext("2d"); //Initialize as a 2D piece.
		for (let i=0; i<8; i++)	{ //Row
			for (let j=0; j<8; j++) { //Column
				if ((j+i)%2==0)	ctx.fillStyle = "rgb(255,248,220)"; //Set color to light Tile
				else ctx.fillStyle = "rgb(139,69,19)"; //Set color to Dark tile
				ctx.fillRect(i*100, j*100, 100, 100);//Fill the square
				$("#homeScreen").remove(); //Remove the home screen
				$("#gameScreen").append('<div class="chessBox" id="'+j+i+'" style="top:'+100*i+'px; left:'+100*j+'px"></div>') //Place an invisible div over each box.
			} 
		}
		//Set up pieces
		this.positions[0][0]=new Rook('br1',0, 0, false, "br.png");
		this.positions[0][1]=new Knight('bn1',1, 0, false, "bn.png");
		this.positions[0][2]=new Bishop('bb1',2, 0, false, "bb.png");
		this.positions[0][3]=new Queen('bq1',3, 0, false, "bq.png");
		this.positions[0][4]=new King('bk1',4, 0, false, "bk.png");
		this.positions[0][5]=new Bishop('bb2',5, 0, false, "bb.png");
		this.positions[0][6]=new Knight('bn2',6, 0, false, "bn.png");
		this.positions[0][7]=new Rook('br2',7, 0, false, "br.png");
		for (let x=0; x<8; x++) {
			this.positions[1][x]=new Pawn("bp"+(x+1),x, 1, false, "bp.png");
		}	
		this.positions[7][0]=new Rook('wr1',0, 7, true, "wr.png");
		this.positions[7][1]=new Knight('wn1',1, 7, true, "wn.png");
		this.positions[7][2]=new Bishop('wb1',2, 7, true, "wb.png");
		this.positions[7][3]=new Queen('wq1',3, 7, true, "wq.png");
		this.positions[7][4]=new King('wk1',4, 7, true, "wk.png");
		this.positions[7][5]=new Bishop('wb2',5, 7, true, "wb.png");
		this.positions[7][6]=new Knight('wn2',6, 7, true, "wn.png");
		this.positions[7][7]=new Rook('wr2',7, 7, true, "wr.png");
		for (let x=0; x<8; x++) {
			this.positions[6][x]=new Pawn("wp"+(x+1), x, 6, true, "wp.png");
		}
		//Draw the pieces for the first time.
		this.drawPieces();
		//Call the first player's moves
		this.visualize(this.isWhite);
		this.get("wk1").castle(this);
		$("#gameScreen").show(100);
		this.move(); 
	} //End of start method.
	/***********************************
	************************************
	drawPieces method: This methods draws
	/updates all the available pieces on 
	to the board.
	************************************
	************************************/
	drawPieces() {
		let piece;
		$(".chessPiece").remove(); //Remove all current chess piece shown and reset them
		$(".dead").remove(); //Remove graveyard pieces to reset them
		//Draw board pieces
		for (let x=0; x<8; x++) { //Loop through all the rows
			for (let y=0; y<8; y++) { //Loop through all the columns
				piece=this.positions[x][y];
				if (piece) { //If the object exits, then there is a piece in the box
					$("#gameScreen").append('<div id="'+piece.id+'" class="chessPiece" style="top:'+100*piece.y+'px; left:'+100*piece.x+'px; background-image: url(images/'+piece.image+')"></div>'); //Print the piece onto canvas
				}
			} 
		}
		//Draw captured pieces
		for (let x=0; x<this.captured.length; x++) { //Loops through all catured pieces.
			piece=this.captured[x];
			if (!piece.isWhite) { //Print the piece into the correct grave based on colour.
				$("#whiteGrave").append("<img class='dead' id='"+piece.id+"' src='images/"+piece.image+"'></img>");
			}
			else {
				$("#blackGrave").append("<img class='dead' id='"+piece.id+"' src='images/"+piece.image+"'></img>");
			}
		}
	} //End of drawPiecs method.
	/***********************************
	************************************
	move method: This methods 
	initiates movement. It allows player
	to drag a piece and drop it to a valid 
	square during their turn.
	************************************
	************************************/
	move() {
		let mouseX=0; //Stores x value of cursor
		let mouseY=0; //Stores y value of cursor
		let gridX=0; //Stores column that the cursor is in.
		let gridY=0; //Stores row that the cursor is in.
		let piece; //Stores pointer to a piece object.
		let pieceId; //Stores the HTML id of a piece clicked and dragged.
		let self=this; //Store pointer of current class to prevent scope clashes.
		//Highlighting
		$(".chessPiece").mouseenter(function(event) { //When mouse enters the piece
			gridX=Math.floor((event.pageX-$("#game").offset().left+1)/100); //Store column piece is in.
			gridY=Math.floor((event.pageY-$("#game").offset().top+1)/100); //Store row piece is in.
			if (!self.isBoundary(gridX, gridY)) return; //Break if not in boundary
			pieceId=this.id; //Extracts and stores HTML id from piece clicked
			piece=self.positions[gridY][gridX]; //Retrieve pointer to that piece.
			if (piece) { //If it exists, proceed
				if (piece.isWhite==self.isWhite) { //If it is the current player's piece, show where it can move.
					if (allowHighlight) piece.highlight(); //Highlight the possible moves of the piece.	
				}
			}						
			$("#"+this.id).mouseleave(function(event) { //When mouse leave the piece.
				$(".chessBox").hide(); //Hide the highlights.
				$("#"+this.id).off("mouseleave");
			})
		});
		//Mouse Down (Hold)
		$(".chessPiece").mousedown(function(event) {
			$(".chessPiece").off("mouseenter").off("mouseleave").off("mousedown"); //Turn off previous event listeners
			$("#"+pieceId).css("z-index", 10); //Make sure the piece has a higher display priority than others when dragged,
			//Drag
			$("#"+pieceId).mousemove(function(event) { //When mouse moves, drag the image along with it
				$("#"+pieceId).css({"top":event.pageY-$("#game").offset().top-50, "left":event.pageX-$("#game").offset().left-50});
			});
			//Drop
			$("#"+pieceId).mouseup(async function(event) {
				$("#"+pieceId).off("mousemove").off("mouseup"); //Turn off previous event listeners.
				$(".chessBox").hide(); //Hide the highlights
				gridX=Math.floor((event.pageX-$("#game").offset().left+1)/100); //Store column piece is in.
				gridY=Math.floor((event.pageY-$("#game").offset().top+1)/100); //Store row piece is in.
				if (piece && self.isBoundary(gridX, gridY) && piece.isLegal(gridX, gridY)) { //If that move was legal...
					soundEffect.play();
					soundEffect.currentTime=0;
					transcript.push(`<tr><td>${transcript.length+1}</td><td>${piece.id}</td><td>${piece.x}, ${piece.y}</td><td>${gridX}, ${gridY}</td></tr>`)
					if (self.positions[gridY][gridX]) self.captured.push(self.positions[gridY][gridX]); //Put captured piece in grave
					self.positions[piece.y][piece.x]=undefined; //Remove piece from old location
					self.positions[gridY][gridX]=piece; //Put piece onto new location
					piece.x=gridX; //Change x location of piece.
					piece.y=gridY; //Change y location on piece.
					piece.firstMove=false;
					if (piece instanceof Pawn) { //If it was a pawn, it can promote
						if (piece.y==7 || piece.y==0) {
							await self.promote(piece); //Waits until player select the piece to promote to and promise is resolved.
						}
					}
					else if (piece instanceof King) { //Could of castled.
						let rook;
						if (piece.castleShort && gridX==6) {
							rook=self.get("wr2");
							self.positions[rook.y][rook.x]=undefined;
							rook.x=5;
							rook.firstMove=false;
							self.positions[7][5]=rook;
						}
						else if (piece.castleLong && gridX==2) {
							rook=self.get("wr1");
							self.positions[rook.y][rook.x]=undefined;
							rook.x=3;
							rook.firstMove=false;
							self.positions[7][3]=rook;
						}
						piece.castleShort=false;
						piece.castleLong=false;
					}
					self.isWhite=!self.isWhite; //Invert the turn (White --> Black Or Black --> White).
					self.drawPieces(); //Redraw the pieces.
					self.visualize(self.isWhite); //Determine all the moves for the next player.					
					if (self.isCheckmate()) displayEndScreen(`${name} WINS! Computer LOSES.`);//Checks if the new player was checkmated by previous player.
					else {
						setTimeout(function() { //AI moves in 250 milliseconds.
							ai.move(self); //Call the AI move function now.
						}, 250);
						return;
					}					
				}
				else { //If the move was not legal or not in boundaries ...
					self.drawPieces(); //Draw pieces without updating the positions.
					self.move(); //Let same player move once again.
				}		
			});
		});
	} //End of move method.
	/***********************************
	************************************
	promote method: This methods 
	allows the player to promote the pawn 
	when the pawn reaches the end. The 
	function uses promises to pause code 
	execution
	************************************
	************************************/
	promote(pawn) {
		return new Promise((resolve, reject)=> {
			let newPiece;
			let self=this;
			$("#dialog").dialog({
				modal: true,
				show: {
					effect: "blind",
					duration: 250
				},
				hide: {
					effect: "explode",
					duration: 250
				},
				buttons: {
					"Confirm": function() {
						$(this).dialog("close");
						newPiece=$("#selPromote").val();
						//Generate new piece class
						switch(newPiece) {
							case "Q":
								newPiece=new Queen(pawn.id, pawn.x, pawn.y, true, 'wq.png');
								break;
							case "R":						
								newPiece=new Rook(pawn.id, pawn.x, pawn.y, true, 'wr.png');
								break;
							case "K":
								newPiece=new Knight(pawn.id, pawn.x, pawn.y, true, 'wk.png');
								break;
							case "B":
								newPiece=new Bishop(pawn.id, pawn.x, pawn.y, true, 'wb.png');
								break;
						}
						//Update on the board
						self.positions[pawn.y][pawn.x]=newPiece;
						//Resolve promise
						resolve();
					},
				}
			});
		});
	} //End of promote method.
	/***********************************
	************************************
	checkmate method: This method tests 
	if the board is in checkmate.
	************************************
	************************************/
	isCheckmate() {
		for (let i=0; i<=7; i++) { //Loop through all rows.
			for (let j=0; j<=7; j++){ //Loop through all columns.
				if (this.positions[i][j]) { //Check if a piece in the square exists.
					if (this.positions[i][j].isWhite==this.isWhite) { //Check if the piece's color is equal to the current player's color
						if (this.positions[i][j].moves.length>0) return false; //Even if one piece can move,
					}
				}
			}
		}
		return true; //If no pieces can move, return true.
	}
	/***********************************
	************************************
	isCheck method: This method checks if 
	a piece is in check
	************************************
	************************************/
	isCheck() {
		let king; //Stores king's object
		this.isWhite==true ? king=this.get("wk1") : king=this.get("bk1"); //If white's turn, store white king. Else, store black king.
		let x=king.x; //Store the x coordinate of king
		let y=king.y; //Store the y coordinate of king
		let piece; //Store piece currently being looked at.
		this.visualize(!this.isWhite, false); //Calculate all places an enemy can move to after player moves their piece.
 		for (let i=0; i<=7; i++) { //Loop through all row of board
			for (let j=0; j<=7; j++) { //Loop through all columns of board
				piece=this.positions[i][j]; //Store the object in a shorter variable
				if (piece) { //Check if a piece exists in the box
					if (piece.isWhite!=this.isWhite) { //If it's color is opposite to the current player's colour, look at its moves
						for (let k=0; k<piece.moves.length; k++) { //Loop through all its possible moves
							if (piece.moves[k][0]==x && piece.moves[k][1]==y) return true; //Check if the piece can move to the current king's location. If it can, then the king is in check.
						}			
					}
				}
			}
		}
		return false; //If no pieces can achieve the king's location, then the king is not in check and the move is legal.
	} //End of isCheck method
	/***********************************
	************************************
	isBoundary method: This function checks 
	if a piece is within boundary
	************************************
	************************************/
	isBoundary(x, y) {
		return (x>=0 && x<=7 && y>=0 && y<=7) ? true:false;
	}
	/***********************************
	************************************
	visualize method: This function couples 
	all the visualize functions for each
	piece and finds all the possible moves 
	before a round.
	************************************
	************************************/
	visualize(isWhite, check=true) {
		for (let i=0; i<=7; i++) { //Loop through rows
			for (let j=0; j<=7; j++) { //Loop through columns
				if (this.positions[i][j]) { //Check if piece exists
					if (this.positions[i][j].isWhite==isWhite) this.positions[i][j].visualize(this, check);  //Visualize all possible moves of that piece.
				}
			}
		}
	}
}
/***********************************
************************************
initialize method: This function is 
used at the begining to start the game 
with correct settings. It pairs the 
start screen with the game.
************************************
************************************/
function initialize() {
	let toggled=false;
	$("#selDifficulty").change(function() {
	    difficulty=+$("#selDifficulty").val();
	});
	$("#sliderBox").click(function() {
		allowHighlight=!allowHighlight;
	});
	$("#btnPlay").click(function() {
		name=$("#txtName").val()
		if (name) {
			$("#selPlayers").off("change");
			$("#selDifficulty").off("change");
			$("#btnPlay").off("click");	
			name=shortenName(name);
			$("#whiteGrave h2").text(`${name}'s Captured Pieces`)
			board.start(difficulty);
		}
		else {
			alert("Enter a name!")
		}
		
	});
	$("#btnHelp").click(function() {
		window.location.href="https://sebnic.info/HaridasanTarun/help/index.html"
	})
}
/***********************************
************************************
bubbleSort function: The function below 
bubble sorts nested arrays. It sorts 
arrays to increasing order.
************************************
************************************/
function bubbleSort(arr, column, ascending=true) {
	let TEMP;
	for (let i=0; i<arr.length; i++) { //Number of passes = number of element
		for (let j=0; j<arr.length-1; j++) { //Each pass, loop to the second last element
			if (ascending) { //Ascending Order
				if (arr[j][column]>arr[j+1][column]) { //If the first number if larger than the second, swap them.
					TEMP=arr[j+1]
					arr[j+1]=arr[j];
					arr[j]=TEMP;
				}
			}
			else { //Descending Order
				if (arr[j][column]<arr[j+1][column]) { //If the first number if larger than the second, swap them.
					TEMP=arr[j+1]
					arr[j+1]=arr[j];
					arr[j]=TEMP;
				}
			}			
		}
	}
	return arr; //Return the sorted array once sorted.
} //End of bubbleSort function
/***********************************
************************************
displayEndScreen function: The function 
displays the right endScreen baesd on 
lose or win, displays the scoreboard 
and the moves transcript.
************************************
************************************/
async function displayEndScreen(message) {
	//Display the message into a dialog box
	$("#gameOver").append(`<p>${message} Click 'OK' to go to the end screen!</p>`);
	let promise = new Promise((resolve, reject)=> {
		$("#gameOver").dialog({
			modal: true,
			show: {
				effect: "blind",
				duration: 250
			},
			hide: {
				effect: "explode",
				duration: 250
			},
			buttons: {
				"OK": function() {
					$(this).dialog("close");
					resolve();			
				},
			}
		});
	});
	await promise;
	//Determine if the player won or lost.
	let winStatus=message.includes("WINS!")?"Won":"Lost"; /*****************STRING FUNCTION (.includes())*********************/
	let date = new Date(); //Initialize date object to find the date the game was played.
	//Retrieve old scores from localstorage
	let gamesPlayed=localStorage.getItem("gamesPlayed"); 
	if (!gamesPlayed) {
		gamesPlayed=[];
	}
	else gamesPlayed=JSON.parse(gamesPlayed);
	gamesPlayed.push([transcript.length, winStatus, `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`]); //Push new game data into the array
	gamesPlayed=bubbleSort(gamesPlayed, 0); //Bubble sort it by the moves column
	for (let i=0; i<gamesPlayed.length; i++) { //Loop through the array, and print each element as a table row.
		$("#tblGamesPlayed").append(`<tr class='dataRow'><td>${gamesPlayed[i][0]}</td><td>${gamesPlayed[i][1]}</td><td>${gamesPlayed[i][2]}</td></tr>`);
	}
	localStorage.setItem("gamesPlayed", JSON.stringify(gamesPlayed));	//Send new array back to local storage
	/*****************************
	CLICK EVENTS TO BUBBLE SORT 
	INDIVIDUAL COLUMNS
	*****************************/
	let movesPressed=false;
	let winOrLosePressed=false;
	let datePressed=false;
	//Click event for movesHeader
	$("#movesHeader").click(function() {
		//If the button has already been pressed, we want to order from greatest to least the next time.
		if (movesPressed) gamesPlayed=bubbleSort(gamesPlayed, 0);		
		else gamesPlayed=bubbleSort(gamesPlayed, 0, false);	
		//Remove all the rows and update them.
		$(".dataRow").remove();
		for (let i=0; i<gamesPlayed.length; i++) {
			$("#tblGamesPlayed").append(`<tr class='dataRow'><td>${gamesPlayed[i][0]}</td><td>${gamesPlayed[i][1]}</td><td>${gamesPlayed[i][2]}</td></tr>`);
		}
		movesPressed=!movesPressed; //Toggle the boolean variable
	});
	//Click event for winOrLoseHeader
	$("#winOrLoseHeader").click(function() {
		//If the button has already been pressed, we want to order from greatest to least the next time.
		if (winOrLosePressed) gamesPlayed=bubbleSort(gamesPlayed, 1);		
		else gamesPlayed=bubbleSort(gamesPlayed, 1, false);	
		//Remove all the rows and update them.	
		$(".dataRow").remove();
		for (let i=0; i<gamesPlayed.length; i++) {
			$("#tblGamesPlayed").append(`<tr class='dataRow'><td>${gamesPlayed[i][0]}</td><td>${gamesPlayed[i][1]}</td><td>${gamesPlayed[i][2]}</td></tr>`)
		}
		winOrLosePressed=!winOrLosePressed; //Toggle the boolean variable
	});
	//Click event for dateHeader
	$("#dateHeader").click(function() {
		//If the button has already been pressed, we want to order from greatest to least the next time.
		if (datePressed) gamesPlayed=bubbleSort(gamesPlayed, 2);		
		else gamesPlayed=bubbleSort(gamesPlayed, 2, false);		
		//Remove all the rows and update them.
		$(".dataRow").remove();
		for (let i=0; i<gamesPlayed.length; i++) {
			$("#tblGamesPlayed").append(`<tr class='dataRow'><td>${gamesPlayed[i][0]}</td><td>${gamesPlayed[i][1]}</td><td>${gamesPlayed[i][2]}</td></tr>`)
		}
		datePressed=!datePressed; //Toggle the boolean variable
	});
	$("#endScreen").show(100); //Show end screen
	$("#gameScreen").hide(100); //Hide the game
	$("#status").append(`<h1>${message}</h1>`); //Display the message
	$("#btnPlayAgain").click(function() { //Set event listener for btnPlayAgain to refresh page.
		window.location.reload();
	});
	for (let i=0; i<transcript.length; i++) { //Loop through the transcript and print each move in a table.
		$("#tblTranscript").append(transcript[i]);
	}	
} //End of endScreen function
/***********************************
************************************
shortenName function: This function 
shortens someone's name to fit on the 
scoreboard.
2 STRING FUNCTIONS ARE USED HERE
************************************
************************************/
function shortenName(name) {
	name=name[0].toUpperCase()+name.slice(1);
	if (name.length>5) {
		name=name.substr(0, 5);
	}
	return name;
} //End of shortenName function
/***********************************
************************************
INITIALIZE GLOBAL VARIABLES
************************************
************************************/
let board=new Game;
let ai=new AI;
let transcript=[];
let difficulty=1;
let allowHighlight=false;
let name="";
let soundEffect=new Audio('audio/drop.mp3')
$(document).ready(function() { //When the document and JQuery is ready, start the game.
	initialize();
	//board.start();
});