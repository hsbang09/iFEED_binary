/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package rbsa.eoss;

import be.ac.ulg.montefiore.run.jadti.AttributeSet;
import be.ac.ulg.montefiore.run.jadti.DecisionTree;
import be.ac.ulg.montefiore.run.jadti.DecisionTreeBuilder;
import be.ac.ulg.montefiore.run.jadti.Item;
import be.ac.ulg.montefiore.run.jadti.ItemSet;
import be.ac.ulg.montefiore.run.jadti.KnownSymbolicValue;
import be.ac.ulg.montefiore.run.jadti.SymbolicAttribute;
import be.ac.ulg.montefiore.run.jadti.io.DecisionTreeToDot;

/**
 *
 * @author Clara
 */
public class DecisionTreeMaker {
    
    //http://www.run.montefiore.ulg.ac.be/~francois/software/jaDTi/example/
    
    static public  DecisionTree buildTree(ItemSet learningSet, AttributeSet testAttributes, 
            SymbolicAttribute goalAttribute) {
	DecisionTreeBuilder builder = new DecisionTreeBuilder(learningSet, testAttributes,
				    goalAttribute);
        return builder.build().decisionTree();
	
	
    }
    

    
    static public void printDot(DecisionTree tree) {
	System.out.println((new DecisionTreeToDot(tree)).produce());
    }
    
    static public void printGuess(Item item, DecisionTree tree) {
	AttributeSet itemAttributes = tree.getAttributeSet();
	SymbolicAttribute goalAttribute = tree.getGoalAttribute();
	
	KnownSymbolicValue goalAttributeValue = 
	    (KnownSymbolicValue) item.valueOf(itemAttributes, goalAttribute);
       
//        AttributeValue[] values = new AttributeValue[item.nbAttributes()];
//        for (int i = 0; i < item.nbAttributes()-1; ++i) {
//            values[i] = item.valueOf(i);
//        }
//        Item item2 = new Item(values);
	KnownSymbolicValue guessedGoalAttributeValue = 
	    tree.guessGoalAttribute(item);

	String s = "Item goal attribute value is " +
	    goalAttribute.valueToString(goalAttributeValue) + "\n";
	
	s += "The value guessed by the tree is " + 
	    tree.getGoalAttribute().valueToString(guessedGoalAttributeValue);
	
	System.out.println(s);
    }

}