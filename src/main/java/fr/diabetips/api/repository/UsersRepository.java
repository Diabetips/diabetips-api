package fr.diabetips.api.repository;

import fr.diabetips.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsersRepository extends JpaRepository<User, Long> {

    Page<User> findAllByDeletedFalse(Pageable p);

    Optional<User> findByUid(UUID uid);

    Optional<User> findByEmailAndDeletedFalse(String email);

    long countByEmailAndDeletedFalse(String email);

}
