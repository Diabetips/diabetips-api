package fr.diabetips.api.repository;

import fr.diabetips.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsersRepository extends JpaRepository<User, Long> {

    Optional<User> findByUid(UUID uid);

    long countByEmailAndDeletedFalse(String email);

}
