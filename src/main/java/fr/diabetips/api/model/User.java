package fr.diabetips.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "Users")
@EntityListeners({ AuditingEntityListener.class })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long id;

    @CreatedDate
    @Column(nullable = false)
    @JsonIgnore
    private Date createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    @JsonIgnore
    private Date modifiedAt;

    @JsonIgnore
    private Date deletedAt;

    @Column(nullable = false)
    @JsonIgnore
    private boolean deleted = false;

    @Column(length = 36, nullable = false, unique = true)
    @Type(type = "uuid-char")
    private UUID uid;

    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be a valid email address")
    @Column(length = 200, nullable = false)
    private String email;

    @NotBlank(message = "password must not be blank")
    @Size(min = 8, message = "password must be 8 characters or longer")
    @Column(length = 100, nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @NotBlank(message = "first_name must not be blank")
    @Column(length = 100, nullable = false)
    private String firstName;

    @NotBlank(message = "last_name must not be blank")
    @Column(length = 100, nullable = false)
    private String lastName;


    public Long getId() {
        return id;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getModifiedAt() {
        return modifiedAt;
    }

    public Date getDeletedAt() {
        return deletedAt;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        if (deleted)
            this.deletedAt = new Date();
        else
            this.deletedAt = null;

        this.deleted = deleted;
    }

    public UUID getUid() { return uid; }

    public void setUid(UUID uid) { this.uid = uid; }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

}
