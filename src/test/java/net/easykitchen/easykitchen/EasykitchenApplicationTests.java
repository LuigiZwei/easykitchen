package net.easykitchen.easykitchen;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;

import net.easykitchen.easykitchen.mappers.GroceryMapper;

@SpringBootTest // Loads the full Spring application context for integration testing
@ComponentScan(basePackages = "net.easykitchen.easykitchen")
class EasykitchenApplicationTests {

	@Autowired
	private GroceryMapper groceryMapper; // Mapper bean should be injected by Spring

	@Test
	void contextLoads() {
		// Test that the Spring context loads and GroceryMapper is available
		assertNotNull(groceryMapper, "GroceryMapper bean should be injected");
	}
}