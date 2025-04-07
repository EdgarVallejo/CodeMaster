import { Problem } from "@shared/schema";

export const initialProblems: Problem[] = [
  {
    id: 1,
    title: "Property Listing System",
    description: "Design a simple system to store and retrieve property listings. Each listing should have an address, price, and number of bedrooms. Implement methods to add a new listing and to find all listings within a given price range.",
    difficulty: "Medium",
    category: "Object-Oriented Design",
    testCases: [
      {
        id: "1",
        name: "Test Case 1: Basic Functionality",
        description: "Tests adding property listings and finding by price range.",
        visible: true,
        input: "",
        expectedOutput: "Found 2 properties in price range."
      },
      {
        id: "2",
        name: "Test Case 2: Edge Cases",
        description: "Tests behavior with invalid inputs and edge cases.",
        visible: true,
        input: "",
        expectedOutput: "Exception handled correctly."
      },
      {
        id: "3",
        name: "Test Case 3: Performance",
        description: "Tests performance with a large number of property listings.",
        visible: true,
        input: "",
        expectedOutput: "Performance test passed."
      }
    ],
    solutionTemplate: {
      "PropertyListing.java": 
`/**
 * PropertyListing class to store property details
 */
public class PropertyListing {
    private String address;
    private int price;
    private int bedrooms;
    
    /**
     * Constructor for creating a new property listing
     */
    public PropertyListing(String address, int price, int bedrooms) {
        this.address = address;
        this.price = price;
        this.bedrooms = bedrooms;
    }
    
    // TODO: Add getters and setters
    
    // TODO: Consider adding validation logic
    
    // TODO: Implement toString method for easy printing
    
}`,
      "PropertyManager.java": 
`/**
 * PropertyManager class to manage property listings
 */
public class PropertyManager {
    // TODO: Add data structure to store listings
    
    /**
     * Adds a new property listing
     */
    public void addListing(PropertyListing listing) {
        // TODO: Implement this method
    }
    
    /**
     * Finds all listings within the given price range
     */
    public List<PropertyListing> findByPriceRange(int minPrice, int maxPrice) {
        // TODO: Implement this method
        return null;
    }
}`,
      "Main.java": 
`import java.util.List;

/**
 * Main class to demonstrate the PropertyListing system
 */
public class Main {
    public static void main(String[] args) {
        // TODO: Create some property listings
        
        // TODO: Add them to a PropertyManager
        
        // TODO: Find properties in a price range
        
        // TODO: Print the results
    }
}`
    }
  },
  {
    id: 2,
    title: "Home Value Estimator",
    description: "Implement a home value estimator that calculates the estimated value of a property based on comparable homes in the area. Each home has a location (x, y coordinates), square footage, number of bedrooms, and number of bathrooms. The algorithm should find similar homes and calculate a weighted average based on similarity.",
    difficulty: "Hard",
    category: "Algorithms",
    testCases: [
      {
        id: "1",
        name: "Test Case 1: Basic Estimation",
        description: "Tests basic home value estimation with a small dataset.",
        visible: true,
        input: "",
        expectedOutput: "Estimated value: $450000"
      },
      {
        id: "2",
        name: "Test Case 2: Edge Cases",
        description: "Tests estimation with edge cases like no comparable homes.",
        visible: true,
        input: "",
        expectedOutput: "No comparable homes found."
      },
      {
        id: "3",
        name: "Test Case 3: Accuracy",
        description: "Tests the accuracy of the estimation algorithm.",
        visible: true,
        input: "",
        expectedOutput: "Estimation within 10% of actual value."
      }
    ],
    solutionTemplate: {
      "Home.java": 
`/**
 * Home class to store property information
 */
public class Home {
    private double x; // x-coordinate of location
    private double y; // y-coordinate of location
    private int squareFootage;
    private int bedrooms;
    private int bathrooms;
    private double value; // known value (for comparison homes)
    
    // TODO: Add constructor, getters, and setters
}`,
      "HomeValueEstimator.java": 
`import java.util.List;

/**
 * HomeValueEstimator class to estimate home values
 */
public class HomeValueEstimator {
    private List<Home> comparableHomes;
    
    // TODO: Add constructor to initialize comparable homes
    
    /**
     * Calculates similarity between two homes
     */
    private double calculateSimilarity(Home home1, Home home2) {
        // TODO: Implement similarity calculation
        return 0.0;
    }
    
    /**
     * Estimates the value of a home
     */
    public double estimateValue(Home home) {
        // TODO: Implement estimation algorithm
        return 0.0;
    }
}`,
      "Main.java": 
`import java.util.ArrayList;
import java.util.List;

/**
 * Main class to demonstrate the HomeValueEstimator
 */
public class Main {
    public static void main(String[] args) {
        // TODO: Create a list of comparable homes
        
        // TODO: Create a home to estimate
        
        // TODO: Create a HomeValueEstimator and estimate the value
        
        // TODO: Print the estimated value
    }
}`
    }
  }
];
