package net.easykitchen.easykitchen;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;

import net.easykitchen.easykitchen.mappers.GroceryMapper;

@SpringBootTest
@ComponentScan(basePackages = "net.easykitchen.easykitchen")
class EasykitchenApplicationTests {
	
	@Autowired
    private GroceryMapper groceryMapper;

	@Test
	void contextLoads() {
		assertNotNull(groceryMapper, "GroceryMapper bean should be injected");
	}
}