// ==================================================================
// Scripts/GameCore/WeaponController.cs
// ------------------------------------------------------------------
// Arma del guardián (Farol de Mina / Pico Encantado). Dispara
// proyectiles y gestiona munición/cooldown.
// ==================================================================

using System.Collections;
using UnityEngine;

namespace RDM.YUN.GameCore
{
    public sealed class WeaponController : MonoBehaviour
    {
        [SerializeField] private GameObject projectilePrefab;
        [SerializeField] private Transform muzzle;
        [SerializeField] private float fireCooldown = 0.25f;
        [SerializeField] private int damage = 30;

        private bool canFire = true;

        public int Damage => damage;

        private void Update()
        {
            if (Input.GetButtonDown("Fire1")) TryFire();
        }

        private void TryFire()
        {
            if (!canFire || projectilePrefab == null || muzzle == null) return;

            canFire = false;
            var projectile = Instantiate(projectilePrefab, muzzle.position, muzzle.rotation);
            projectile.GetComponent<Projectile>()?.Launch(muzzle.forward, damage);
            StartCoroutine(Reload(fireCooldown));
        }

        private IEnumerator Reload(float delay)
        {
            yield return new WaitForSeconds(delay);
            canFire = true;
        }
    }
}
