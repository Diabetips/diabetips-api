package fr.diabetips.api;

import fr.diabetips.api.model.User;
import fr.diabetips.api.repository.UsersRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Optional;
import java.util.UUID;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@RunWith(SpringRunner.class)
@DataJpaTest
@EnableJpaAuditing
public class UsersRepositoryTests {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UsersRepository usersRepository;

    @Test
    public void testFindByUid() {
        User u = new User();
        u.setUid(UUID.randomUUID());
        u.setEmail("test@example.com");
        u.setPassword("testtest");
        u.setFirstName("Test");
        u.setLastName("TEST");
        entityManager.persist(u);
        entityManager.flush();

        Optional<User> found = usersRepository.findByUidAndDeletedFalse(u.getUid());

        assertTrue(found.isPresent());
        assertEquals(u.getUid(),       found.get().getUid());
        assertEquals(u.getEmail(),     found.get().getEmail());
        assertEquals(u.getFirstName(), found.get().getFirstName());
        assertEquals(u.getLastName(),  found.get().getLastName());
    }

    @Test
    public void testFindByUid_deleted() {
        User u = new User();
        u.setUid(UUID.randomUUID());
        u.setEmail("test@example.com");
        u.setPassword("testtest");
        u.setFirstName("Test");
        u.setLastName("TEST");
        u.setDeleted(true);
        entityManager.persist(u);
        entityManager.flush();

        Optional<User> found = usersRepository.findByUidAndDeletedFalse(u.getUid());

        assertFalse(found.isPresent());
    }

    @Test
    public void testFindByEmail() {
        User u = new User();
        u.setUid(UUID.randomUUID());
        u.setEmail("test@example.com");
        u.setPassword("testtest");
        u.setFirstName("Test");
        u.setLastName("TEST");
        entityManager.persist(u);
        entityManager.flush();

        Optional<User> found = usersRepository.findByEmailAndDeletedFalse(u.getEmail());

        assertTrue(found.isPresent());
        assertEquals(u.getUid(),       found.get().getUid());
        assertEquals(u.getEmail(),     found.get().getEmail());
        assertEquals(u.getFirstName(), found.get().getFirstName());
        assertEquals(u.getLastName(),  found.get().getLastName());
    }

    @Test
    public void testFindByEmail_deleted() {
        User u = new User();
        u.setUid(UUID.randomUUID());
        u.setEmail("test@example.com");
        u.setPassword("testtest");
        u.setFirstName("Test");
        u.setLastName("TEST");
        u.setDeleted(true);
        entityManager.persist(u);
        entityManager.flush();

        Optional<User> found = usersRepository.findByEmailAndDeletedFalse(u.getEmail());

        assertFalse(found.isPresent());
    }

    @Test
    public void testCountByEmail() {

        User u = new User();
        u.setUid(UUID.randomUUID());
        u.setEmail("test@example.com");
        u.setPassword("testtest");
        u.setFirstName("Test");
        u.setLastName("TEST");

        long before = usersRepository.countByEmailAndDeletedFalse(u.getEmail());
        entityManager.persist(u);
        entityManager.flush();
        long after = usersRepository.countByEmailAndDeletedFalse(u.getEmail());

        assertEquals(before + 1, after);
    }

    @Test
    public void testCountByEmail_deleted() {

        User u = new User();
        u.setUid(UUID.randomUUID());
        u.setEmail("test@example.com");
        u.setPassword("testtest");
        u.setFirstName("Test");
        u.setLastName("TEST");
        u.setDeleted(true);

        long before = usersRepository.countByEmailAndDeletedFalse(u.getEmail());
        entityManager.persist(u);
        entityManager.flush();
        long after = usersRepository.countByEmailAndDeletedFalse(u.getEmail());

        assertEquals(before, after);
    }

}
